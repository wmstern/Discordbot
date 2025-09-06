import { Command, Cooldown, DeferReply, Execute } from '#framework';
import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { GameManager } from '../../games/games.service.ts';
import { TTTCollector } from './tic_tac_toe.collector.ts';
import { Difficulties } from './tic_tac_toe.constants.ts';
import { GameLogic } from './tic_tac_toe.logic.ts';

const manager = new GameManager(GameLogic);
const collector = new TTTCollector();

@Command(
  new SlashCommandBuilder()
    .setName('tic_tac_toe')
    .setDescription('El clasico juego tic tac toe.')
    .addUserOption((opt) => opt.setName('adversario').setDescription('El segundo jugador.').setRequired(false))
    .addStringOption((opt) =>
      opt
        .setName('dificultad')
        .setDescription('Escoge la dificultad contra la que jugaras contra el bot.')
        .setChoices(Object.values(Difficulties).map((v) => ({ name: v, value: v })))
        .setRequired(false)
    )
    .toJSON()
)
export class TTTCommand {
  @Execute()
  @DeferReply(true)
  @Cooldown(12000)
  async run(i: ChatInputCommandInteraction): Promise<void> {
    const channel = i.channelId;

    if (manager.games.has(channel)) {
      await i.followUp({
        content: 'Ya hay una partida en el canal.',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const player1 = i.user;
    const player2 = i.options.getUser('adversario', false) ?? i.client.user;
    const difficulty = (i.options.getString('dificultad', false) as Difficulties | null) ?? Difficulties.MEDIUM;

    const game = new GameLogic(player1, player2, difficulty);

    manager.addGame(channel, game);

    const msg = await i.editReply({
      content: `Turno de ${game.currentPlayer.username}`,
      components: game.renderBoard(false)
    });

    collector.create(msg, game, manager);
  }
}
