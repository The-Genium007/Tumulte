import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import Campaign from '#models/campaign'
import CampaignMembership from '#models/campaign_membership'
import Streamer from '#models/streamer'
import PollInstance from '#models/poll_instance'
import TwitchApiService from '#services/twitch_api_service'
import PollService from '#services/poll_service'
import WebSocketService from '#services/websocket_service'

export default class CampaignsController {
  private readonly twitchApiService = new TwitchApiService()
  private readonly pollService = new PollService()
  private readonly webSocketService = new WebSocketService()

  // ========== MJ Actions ==========

  /**
   * Liste toutes les campagnes du MJ connecté
   */
  async listCampaigns({ auth, response }: HttpContext) {
    const campaigns = await Campaign.query()
      .where('owner_id', auth.user!.id)
      .preload('memberships')
      .orderBy('created_at', 'desc')

    return response.ok({
      data: campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        member_count: c.memberships.length,
        active_member_count: c.memberships.filter((m) => m.status === 'ACTIVE').length,
        created_at: c.createdAt.toISO(),
      })),
    })
  }

  /**
   * Crée une nouvelle campagne
   */
  async createCampaign({ auth, request, response }: HttpContext) {
    const { name, description } = request.only(['name', 'description'])

    if (!name) {
      return response.badRequest({ error: 'Name is required' })
    }

    const campaign = await Campaign.create({
      name,
      description,
      ownerId: auth.user!.id,
    })

    logger.info(`Campaign ${campaign.id} created by MJ ${auth.user!.id}`)

    // Ajouter automatiquement le MJ comme membre actif de la campagne
    await auth.user!.load('streamer')
    if (auth.user!.streamer) {
      await CampaignMembership.create({
        campaignId: campaign.id,
        streamerId: auth.user!.streamer.id,
        status: 'ACTIVE',
        invitedAt: DateTime.now(),
        acceptedAt: DateTime.now(),
      })
      logger.info(
        `MJ ${auth.user!.id} automatically added as active member to campaign ${campaign.id}`
      )
    }

    return response.created({ data: campaign })
  }

  /**
   * Récupère les détails d'une campagne avec ses membres
   */
  async getCampaign({ auth, params, response }: HttpContext) {
    const campaign = await Campaign.query()
      .where('id', params.id)
      .where('owner_id', auth.user!.id)
      .preload('memberships', (query) => {
        query.preload('streamer')
      })
      .first()

    if (!campaign) {
      return response.notFound({ error: 'Campaign not found' })
    }

    return response.ok({
      data: {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        owner_id: campaign.ownerId,
        members: campaign.memberships.map((m) => ({
          id: m.id,
          status: m.status,
          is_owner: m.streamer.userId === campaign.ownerId,
          streamer: {
            id: m.streamer.id,
            twitch_display_name: m.streamer.twitchDisplayName,
            twitch_login: m.streamer.twitchLogin,
            profile_image_url: m.streamer.profileImageUrl,
            broadcaster_type: m.streamer.broadcasterType,
          },
          invited_at: m.invitedAt.toISO(),
          accepted_at: m.acceptedAt?.toISO(),
        })),
        created_at: campaign.createdAt.toISO(),
      },
    })
  }

  /**
   * Met à jour une campagne
   */
  async updateCampaign({ auth, params, request, response }: HttpContext) {
    const campaign = await Campaign.query()
      .where('id', params.id)
      .where('owner_id', auth.user!.id)
      .first()

    if (!campaign) {
      return response.notFound({ error: 'Campaign not found' })
    }

    const { name, description } = request.only(['name', 'description'])

    if (name) campaign.name = name
    if (description !== undefined) campaign.description = description

    await campaign.save()

    logger.info(`Campaign ${campaign.id} updated by MJ ${auth.user!.id}`)

    return response.ok({ data: campaign })
  }

  /**
   * Supprime une campagne (cascade géré par DB)
   */
  async deleteCampaign({ auth, params, response }: HttpContext) {
    const campaign = await Campaign.query()
      .where('id', params.id)
      .where('owner_id', auth.user!.id)
      .first()

    if (!campaign) {
      return response.notFound({ error: 'Campaign not found' })
    }

    // Arrêter les polls en cours
    const runningPolls = await PollInstance.query()
      .where('campaign_id', campaign.id)
      .where('status', 'RUNNING')

    for (const poll of runningPolls) {
      await this.pollService.stopPolling(poll.id)
    }

    await campaign.delete()

    logger.info(`Campaign ${campaign.id} deleted by MJ ${auth.user!.id}`)

    return response.ok({ message: 'Campaign deleted' })
  }

  /**
   * Invite un streamer à rejoindre la campagne
   */
  async inviteStreamer({ auth, params, request, response }: HttpContext) {
    const campaign = await Campaign.query()
      .where('id', params.id)
      .where('owner_id', auth.user!.id)
      .first()

    if (!campaign) {
      return response.notFound({ error: 'Campaign not found' })
    }

    const body = request.only([
      'streamer_id',
      'twitch_user_id',
      'twitch_login',
      'twitch_display_name',
      'profile_image_url',
    ])

    // Cas 1: streamer_id fourni (streamer déjà dans notre système)
    let streamer: Streamer | null = null

    if (body.streamer_id) {
      streamer = await Streamer.find(body.streamer_id)
      if (!streamer) {
        return response.notFound({ error: 'Streamer not found' })
      }
    }
    // Cas 2: Données Twitch fournies (nouveau streamer)
    else if (body.twitch_user_id && body.twitch_login && body.twitch_display_name) {
      // Vérifier si le streamer existe déjà par twitch_user_id
      streamer = await Streamer.query().where('twitch_user_id', body.twitch_user_id).first()

      // Si pas trouvé, créer un nouveau streamer (sans user associé pour l'instant)
      if (!streamer) {
        streamer = await Streamer.create({
          twitchUserId: body.twitch_user_id,
          twitchLogin: body.twitch_login,
          twitchDisplayName: body.twitch_display_name,
          profileImageUrl: body.profile_image_url || null,
          isActive: false, // Inactif jusqu'à ce qu'il se connecte
          // userId sera défini quand le streamer se connectera via OAuth
        })
        logger.info(`New streamer created: ${streamer.id} (${body.twitch_login})`)
      }
    } else {
      return response.badRequest({
        error:
          'Either streamer_id or twitch user data (twitch_user_id, twitch_login, twitch_display_name) is required',
      })
    }

    // Vérifier qu'il n'est pas déjà membre
    const existing = await CampaignMembership.query()
      .where('campaign_id', campaign.id)
      .where('streamer_id', streamer.id)
      .first()

    if (existing) {
      return response.badRequest({
        error:
          existing.status === 'PENDING' ? 'Invitation already sent' : 'Streamer already member',
      })
    }

    const membership = await CampaignMembership.create({
      campaignId: campaign.id,
      streamerId: streamer.id,
      status: 'PENDING',
      invitedAt: DateTime.now(),
    })

    logger.info(`Streamer ${streamer.id} invited to campaign ${campaign.id} by MJ ${auth.user!.id}`)

    return response.created({ data: membership })
  }

  /**
   * Retire un membre de la campagne
   */
  async removeMember({ auth, params, response }: HttpContext) {
    const campaign = await Campaign.query()
      .where('id', params.id)
      .where('owner_id', auth.user!.id)
      .first()

    if (!campaign) {
      return response.notFound({ error: 'Campaign not found' })
    }

    const membership = await CampaignMembership.query()
      .where('id', params.memberId)
      .where('campaign_id', campaign.id)
      .first()

    if (!membership) {
      return response.notFound({ error: 'Member not found' })
    }

    // Si le membre était actif, le retirer des polls en cours
    if (membership.status === 'ACTIVE') {
      await this.pollService.removeStreamerFromCampaignPolls(membership.streamerId, campaign.id)
    }

    await membership.delete()

    logger.info(`Member ${membership.id} removed from campaign ${campaign.id}`)

    return response.ok({ message: 'Member removed' })
  }

  /**
   * Active manuellement un membre en attente (dev only)
   */
  async activateMember({ auth, params, response }: HttpContext) {
    const campaign = await Campaign.query()
      .where('id', params.id)
      .where('owner_id', auth.user!.id)
      .first()

    if (!campaign) {
      return response.notFound({ error: 'Campaign not found' })
    }

    const membership = await CampaignMembership.query()
      .where('id', params.memberId)
      .where('campaign_id', campaign.id)
      .first()

    if (!membership) {
      return response.notFound({ error: 'Member not found' })
    }

    if (membership.status === 'ACTIVE') {
      return response.badRequest({ error: 'Member is already active' })
    }

    // Activer le membre
    membership.status = 'ACTIVE'
    membership.acceptedAt = DateTime.now()
    await membership.save()

    logger.info(`Member ${membership.id} manually activated in campaign ${campaign.id}`)

    return response.ok({ message: 'Member activated' })
  }

  /**
   * Recherche des streamers via Twitch API
   */
  async searchStreamers({ request, response }: HttpContext) {
    const { q } = request.qs()

    if (!q || q.length < 2) {
      return response.badRequest({ error: 'Query must be at least 2 characters' })
    }

    try {
      // Utiliser un App Access Token pour la recherche
      const accessToken = await this.twitchApiService.getAppAccessToken()

      const results = await this.twitchApiService.searchUsers(q, accessToken)

      // Chercher les streamers existants dans notre système pour enrichir les données
      const twitchUserIds = results.map((r) => r.id)
      const existingStreamers = await Streamer.query().whereIn('twitch_user_id', twitchUserIds)

      const streamerMap = new Map(existingStreamers.map((s) => [s.twitchUserId, s]))

      // Retourner tous les résultats Twitch, avec l'ID de notre système si disponible
      const data = results.map((r) => {
        const existingStreamer = streamerMap.get(r.id)
        return {
          id: existingStreamer?.id || null, // ID de notre système (null si pas encore enregistré)
          twitch_user_id: r.id,
          twitch_login: r.login,
          twitch_display_name: r.display_name,
          profile_image_url: r.profile_image_url,
          is_registered: !!existingStreamer, // Indique si le streamer est déjà dans notre système
        }
      })

      return response.ok({ data })
    } catch (error) {
      logger.error(`Failed to search streamers: ${error.message}`)
      return response.internalServerError({ error: 'Failed to search streamers' })
    }
  }

  // ========== Streamer Actions ==========

  /**
   * Liste les invitations en attente pour le streamer
   */
  async listInvitations({ auth, response }: HttpContext) {
    await auth.user!.load('streamer')

    if (!auth.user!.streamer) {
      return response.notFound({ error: 'Streamer profile not found' })
    }

    const streamerId = auth.user!.streamer.id

    const invitations = await CampaignMembership.query()
      .where('streamer_id', streamerId)
      .where('status', 'PENDING')
      .preload('campaign', (query) => {
        query.preload('owner')
      })

    return response.ok({
      data: invitations.map((i) => ({
        id: i.id,
        campaign: {
          id: i.campaign.id,
          name: i.campaign.name,
          description: i.campaign.description,
          owner_name: i.campaign.owner.displayName,
        },
        invited_at: i.invitedAt.toISO(),
      })),
    })
  }

  /**
   * Accepte une invitation
   */
  async acceptInvitation({ auth, params, response }: HttpContext) {
    await auth.user!.load('streamer')

    if (!auth.user!.streamer) {
      return response.notFound({ error: 'Streamer profile not found' })
    }

    const streamerId = auth.user!.streamer.id

    const membership = await CampaignMembership.query()
      .where('id', params.id)
      .where('streamer_id', streamerId)
      .where('status', 'PENDING')
      .first()

    if (!membership) {
      return response.notFound({ error: 'Invitation not found' })
    }

    membership.status = 'ACTIVE'
    membership.acceptedAt = DateTime.now()
    await membership.save()

    logger.info(`Streamer ${streamerId} accepted invitation ${params.id}`)

    return response.ok({ data: membership })
  }

  /**
   * Refuse une invitation
   */
  async declineInvitation({ auth, params, response }: HttpContext) {
    await auth.user!.load('streamer')

    if (!auth.user!.streamer) {
      return response.notFound({ error: 'Streamer profile not found' })
    }

    const streamerId = auth.user!.streamer.id

    const membership = await CampaignMembership.query()
      .where('id', params.id)
      .where('streamer_id', streamerId)
      .where('status', 'PENDING')
      .first()

    if (!membership) {
      return response.notFound({ error: 'Invitation not found' })
    }

    await membership.delete()

    logger.info(`Streamer ${streamerId} declined invitation ${params.id}`)

    return response.ok({ message: 'Invitation declined' })
  }

  /**
   * Liste les campagnes actives du streamer
   */
  async listActiveCampaigns({ auth, response }: HttpContext) {
    await auth.user!.load('streamer')

    if (!auth.user!.streamer) {
      return response.notFound({ error: 'Streamer profile not found' })
    }

    const streamerId = auth.user!.streamer.id

    const memberships = await CampaignMembership.query()
      .where('streamer_id', streamerId)
      .where('status', 'ACTIVE')
      .preload('campaign', (query) => {
        query.preload('owner')
      })

    return response.ok({
      data: memberships.map((m) => ({
        id: m.campaign.id,
        name: m.campaign.name,
        description: m.campaign.description,
        owner_name: m.campaign.owner.displayName,
        joined_at: m.acceptedAt?.toISO(),
      })),
    })
  }

  /**
   * Quitte une campagne
   */
  async leaveCampaign({ auth, params, response }: HttpContext) {
    await auth.user!.load('streamer')

    if (!auth.user!.streamer) {
      return response.notFound({ error: 'Streamer profile not found' })
    }

    const streamerId = auth.user!.streamer.id

    const membership = await CampaignMembership.query()
      .where('campaign_id', params.id)
      .where('streamer_id', streamerId)
      .where('status', 'ACTIVE')
      .first()

    if (!membership) {
      return response.notFound({ error: 'Campaign membership not found' })
    }

    // Retirer des polls en cours
    await this.pollService.removeStreamerFromCampaignPolls(streamerId, params.id)

    // Émettre l'événement WebSocket
    this.webSocketService.emitStreamerLeftCampaign(streamerId, params.id)

    await membership.delete()

    logger.info(`Streamer ${streamerId} left campaign ${params.id}`)

    return response.ok({ message: 'Left campaign' })
  }
}
