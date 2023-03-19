import { Handler, IA, On, SubCommand } from '@discord-nestjs/core';
import {
  ChannelType,
  Guild,
  If,
  InternalDiscordGatewayAdapterCreator,
  Message,
  PermissionFlagsBits,
  VoiceBasedChannel,
} from 'discord.js';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PlayService } from '../play.service';

@SubCommand({ name: 'join', description: 'join a channel' })
export class JoinSubCommand {
  constructor(
    @InjectPinoLogger(JoinSubCommand.name) private readonly logger: PinoLogger,
    private readonly playService: PlayService,
  ) {}

  @Handler()
  handler(@IA() dto: Message): string {
    return `Success register user:`;
  }

  @OnEvent('join')
  async on(args: string[], message: Message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("You're not MANAGE_CHANNELS permission");
    }
    if (!message.member.voice?.channel) {
      return message.reply("You're not in any voice channel");
    }

    const channelId = message.member.voice.channel.id;
    const guildId = message.guild.id;
    const uri = args.join(' ');
    const connection = this.playService.createConnection({
      channelId: channelId,
      guildId: guildId,
      adapterCreator: message.guild.voiceAdapterCreator,
      selfMute: false,
      selfDeaf: false,
    });
    await this.playService.play(
      message.guild,
      message.member.voice.channel,
      connection,
      uri,
    );
  }
}
