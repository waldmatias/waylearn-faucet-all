import { createBot, InteractionResponseTypes, InteractionTypes } from "discordeno";
import { transferTokens } from "../services/faucet.ts";


const bot = createBot({
    token: Deno.env.get("WAYLEARN_BOT_TOKEN") ?? "",
    applicationId: BigInt(Deno.env.get("APPLICATION_ID") ?? ""),
    desiredProperties: {
        interaction: {
            id: true, 
            token: true, 
            type: true, 
            data: true, 
            user: true, 
            member: true, 
        },
    },
    events: {
        interactionCreate(interaction) {
            // 1. Guard against empty/undefined interactions immediately
            if (!interaction) return;

            // 2. Filter for Slash Commands
            if (interaction.type === InteractionTypes.ApplicationCommand) {
                const commandName = interaction.data?.name;

                switch (commandName) {
                    case "ping":
                        return handlePing(interaction);
                    case "drip":
                        return handleDrip(interaction);
                }
            }
        }
    }
});

const handleDrip =  async(interaction) => {
    const bot = interaction.bot;
    
    await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
        type: InteractionResponseTypes.DeferredChannelMessageWithSource,
    });

    try {
        // 2. Extract the password from the options
        const reqAddress = interaction.data?.options?.[0]?.value as string;

        // 3. RUN YOUR EFFECT (The Solana logic)
        const signature = await transferTokens(reqAddress);

        // 4. Update the response with the signature
        await bot.helpers.editOriginalInteractionResponse(interaction.token, {
            content: `✅ Success! Transaction: https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        });
    } catch (err) {
        await bot.helpers.editOriginalInteractionResponse(interaction.token, {
            content: `❌ Error: ${err.message}`,
        });
    }
}

const handlePing = async (interaction) => {
    const bot = interaction.bot;
    await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: { content: "🏓 Pong!" },
    });
}

await bot.helpers.upsertGlobalApplicationCommands([
    {
        name: "ping",
        description: "Check if the faucet bot is alive",
    },
    {
        name: "drip",
        description: "Request devnet SOL",
        options: [
            {
                name: "address",
                description: "Your address",
                type: 3, // 3 = ApplicationCommandOptionTypes.String
                required: true,
            }
        ]
    }
]);
console.log("✅ Commands registered!");

await bot.start();