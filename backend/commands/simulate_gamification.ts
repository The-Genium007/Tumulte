import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { campaign as Campaign } from '#models/campaign'
import { campaignMembership as CampaignMembership } from '#models/campaign_membership'
import CampaignGamificationConfig from '#models/campaign_gamification_config'
import StreamerGamificationConfig from '#models/streamer_gamification_config'
import { ObjectiveCalculator } from '#services/gamification/objective_calculator'
import { randomUUID, createHmac } from 'node:crypto'

export default class SimulateGamification extends BaseCommand {
  static commandName = 'gamification:simulate'
  static description = 'Simulate Twitch Channel Points redemptions for gamification testing'

  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
    staysAlive: false,
  }

  @flags.string({ alias: 'e', description: 'Event slug (e.g., "dice-invert")' })
  declare event?: string

  @flags.number({ alias: 'n', description: 'Number of contributions to send' })
  declare contributions?: number

  @flags.number({ description: 'Delay between contributions in ms (default: 500)' })
  declare delay?: number

  @flags.boolean({ description: 'Skip delay (fast mode)' })
  declare fast?: boolean

  @flags.boolean({ description: 'Auto-fill to exactly reach the objective target' })
  declare fill?: boolean

  @flags.boolean({ description: 'Reset cooldowns before simulating' })
  declare resetCooldown?: boolean

  @flags.number({ description: 'Override viewer count for objective calculation (default: 100)' })
  declare viewerCount?: number

  async run() {
    this.logger.info('🎮 Simulation de redemptions Channel Points\n')

    // Vérifier le secret EventSub
    const webhookSecret = env.get('TWITCH_EVENTSUB_SECRET') || ''
    if (!webhookSecret) {
      this.logger.error(
        'TWITCH_EVENTSUB_SECRET non configuré dans .env. ' +
          'Ajoutez un secret (ex: "dev-test-secret") pour la vérification de signature.'
      )
      return
    }

    // Étape 1 : Sélection campagne
    const campaigns = await Campaign.query().preload('owner').orderBy('name', 'asc')
    if (campaigns.length === 0) {
      this.logger.error("Aucune campagne trouvée. Créez-en une via l'interface.")
      return
    }

    const campaignChoice = await this.prompt.choice(
      'Sélectionnez une campagne',
      campaigns.map((c) => ({
        name: c.id,
        message: `${c.name} (owner: ${c.owner?.email || 'N/A'})`,
      }))
    )
    const selectedCampaign = campaigns.find((c) => c.id === campaignChoice)!

    // Étape 2 : Sélection streamer
    const memberships = await CampaignMembership.query()
      .where('campaignId', selectedCampaign.id)
      .where('status', 'ACTIVE')
      .preload('streamer')

    if (memberships.length === 0) {
      this.logger.error('Aucun streamer actif dans cette campagne.')
      return
    }

    const streamerChoice = await this.prompt.choice(
      'Sélectionnez un streamer',
      memberships.map((m) => ({
        name: m.streamerId,
        message: `${m.streamer?.twitchDisplayName || m.streamer?.twitchLogin || m.streamerId}`,
      }))
    )
    const selectedMembership = memberships.find((m) => m.streamerId === streamerChoice)!
    const streamer = selectedMembership.streamer

    if (!streamer?.twitchUserId) {
      this.logger.error("Ce streamer n'a pas de compte Twitch lié.")
      return
    }

    // Étape 3 : Sélection événement
    const campaignConfigs = await CampaignGamificationConfig.query()
      .where('campaignId', selectedCampaign.id)
      .where('isEnabled', true)
      .preload('event')

    if (campaignConfigs.length === 0) {
      this.logger.error(
        'Aucun événement gamification activé pour cette campagne. ' +
          "Activez un événement depuis l'interface MJ."
      )
      return
    }

    let selectedConfig: CampaignGamificationConfig
    if (this.event) {
      const found = campaignConfigs.find((c) => c.event?.slug === this.event)
      if (!found) {
        this.logger.error(`Événement "${this.event}" non trouvé ou désactivé.`)
        this.logger.info(
          `Événements disponibles: ${campaignConfigs.map((c) => c.event?.slug).join(', ')}`
        )
        return
      }
      selectedConfig = found
    } else {
      const eventChoice = await this.prompt.choice(
        'Sélectionnez un événement',
        campaignConfigs.map((c) => ({
          name: c.eventId,
          message: `${c.event?.slug} (${c.event?.name}) - coût: ${c.getEffectiveCost(c.event!)} pts`,
        }))
      )
      selectedConfig = campaignConfigs.find((c) => c.eventId === eventChoice)!
    }

    // Étape 4 : Vérifier ou auto-provisionner StreamerGamificationConfig
    let streamerConfig = await StreamerGamificationConfig.query()
      .where('streamerId', streamer.id)
      .where('campaignId', selectedCampaign.id)
      .where('eventId', selectedConfig.eventId)
      .preload('event')
      .first()

    if (!streamerConfig) {
      // Créer la config si elle n'existe pas
      streamerConfig = await StreamerGamificationConfig.create({
        campaignId: selectedCampaign.id,
        streamerId: streamer.id,
        eventId: selectedConfig.eventId,
        isEnabled: true,
        twitchRewardStatus: 'not_created',
      })
      await streamerConfig.load('event')
      this.logger.info('  StreamerGamificationConfig créée automatiquement')
    }

    if (!streamerConfig.isEnabled) {
      streamerConfig.isEnabled = true
      await streamerConfig.save()
      this.logger.info('  StreamerGamificationConfig activée')
    }

    // Auto-provisionner un twitchRewardId simulé si absent (non-affilié)
    if (!streamerConfig.twitchRewardId) {
      const simRewardId = `sim_reward_${randomUUID()}`
      streamerConfig.twitchRewardId = simRewardId
      streamerConfig.twitchRewardStatus = 'active' as any
      await streamerConfig.save()
      this.logger.info(`  twitchRewardId simulé créé: ${simRewardId.substring(0, 20)}...`)
    }

    // Étape 5 : Reset cooldown optionnel
    if (this.resetCooldown) {
      const gamificationService = await app.container.make('gamificationService')
      await gamificationService.onSessionStart(selectedCampaign.id)
      this.logger.success('Cooldowns réinitialisés')
    }

    // Étape 6 : Calcul du nombre de contributions
    const viewerCount = this.viewerCount || 100
    const calculator = new ObjectiveCalculator()
    const objectiveTarget = calculator.calculateIndividual(
      viewerCount,
      selectedConfig,
      selectedConfig.event!
    )

    const effectiveCost = streamerConfig.getEffectiveCost(selectedConfig, selectedConfig.event!)
    let totalContributions: number

    if (this.fill) {
      totalContributions = objectiveTarget
    } else if (this.contributions) {
      totalContributions = this.contributions
    } else {
      totalContributions = objectiveTarget
    }

    const delayMs = this.fast ? 0 : (this.delay ?? 500)

    this.logger.info(`  Campagne:      ${selectedCampaign.name}`)
    this.logger.info(`  Streamer:      ${streamer.twitchDisplayName || streamer.twitchLogin}`)
    this.logger.info(
      `  Événement:     ${selectedConfig.event!.name} (${selectedConfig.event!.slug})`
    )
    this.logger.info(`  Objectif:      ${objectiveTarget} contributions`)
    this.logger.info(`  À envoyer:     ${totalContributions} contributions`)
    this.logger.info(`  Coût/clic:     ${effectiveCost} points`)
    this.logger.info(`  Délai:         ${delayMs}ms`)
    this.logger.info('')

    // Étape 7 : Boucle de simulation via self HTTP call
    const port = env.get('PORT', 3333)
    const host = env.get('HOST', 'localhost')
    const webhookUrl = `http://${host}:${port}/webhooks/twitch/eventsub`

    let lastStatus = 200

    for (let i = 0; i < totalContributions; i++) {
      const redemptionId = randomUUID()
      const testViewerId = String(Math.floor(Math.random() * 900000000) + 100000000)
      const testViewerName = `test_viewer_${Math.floor(Math.random() * 9999)}`

      const eventsubPayload = {
        subscription: {
          id: randomUUID(),
          type: 'channel.channel_points_custom_reward_redemption.add',
          version: '1',
          status: 'enabled',
          condition: { broadcaster_user_id: streamer.twitchUserId },
          transport: { method: 'webhook', callback: webhookUrl },
          created_at: new Date().toISOString(),
        },

        event: {
          id: redemptionId,
          broadcaster_user_id: streamer.twitchUserId,
          broadcaster_user_login: streamer.twitchLogin || 'test_broadcaster', // eslint-disable-line camelcase
          broadcaster_user_name: streamer.twitchDisplayName || 'Test_Broadcaster', // eslint-disable-line camelcase
          user_id: testViewerId,
          user_login: testViewerName, // eslint-disable-line camelcase
          user_name: testViewerName, // eslint-disable-line camelcase
          user_input: '', // eslint-disable-line camelcase
          status: 'unfulfilled',
          reward: {
            id: streamerConfig.twitchRewardId,
            title: streamerConfig.event?.name || 'Gamification Test',
            cost: effectiveCost,
            prompt: '',
          },
          redeemed_at: new Date().toISOString(), // eslint-disable-line camelcase
        },
      }

      // Calculer la signature HMAC-SHA256
      const messageId = randomUUID()
      const timestamp = new Date().toISOString()
      const bodyString = JSON.stringify(eventsubPayload)
      const hmacMessage = messageId + timestamp + bodyString
      const signature =
        'sha256=' + createHmac('sha256', webhookSecret).update(hmacMessage).digest('hex')

      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Twitch-Eventsub-Message-Id': messageId,
            'Twitch-Eventsub-Message-Timestamp': timestamp,
            'Twitch-Eventsub-Message-Signature': signature,
            'Twitch-Eventsub-Message-Type': 'notification',
          },
          body: bodyString,
        })

        lastStatus = res.status
        const progress = Math.min(i + 1, objectiveTarget)
        const percentage = Math.round((progress / objectiveTarget) * 100)
        const bar = this.renderProgressBar(progress, objectiveTarget, 25)

        if (res.status === 200) {
          this.logger.info(
            `  [${String(i + 1).padStart(3)}/${totalContributions}] ${bar} ${percentage}% - ${testViewerName}`
          )
        } else {
          this.logger.warning(
            `  [${String(i + 1).padStart(3)}/${totalContributions}] HTTP ${res.status} - ${testViewerName}`
          )
        }
      } catch (err) {
        this.logger.error(`  [${String(i + 1).padStart(3)}] Erreur: ${(err as Error).message}`)
        break
      }

      // Délai entre contributions
      if (i < totalContributions - 1 && delayMs > 0) {
        await this.sleep(delayMs)
      }
    }

    // Résumé
    this.logger.info('')
    if (lastStatus === 200) {
      this.logger.success(`Simulation terminée: ${totalContributions} redemptions envoyées`)
      this.logger.info(
        `  L'overlay devrait afficher la jauge. ` +
          `Si l'objectif est atteint (${objectiveTarget}), l'instance est armée.`
      )
    } else {
      this.logger.warning('Certaines redemptions ont échoué. Vérifiez les logs backend.')
    }
  }

  private renderProgressBar(current: number, total: number, width: number): string {
    const ratio = Math.min(current / total, 1)
    const filled = Math.round(ratio * width)
    const empty = width - filled
    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']'
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
