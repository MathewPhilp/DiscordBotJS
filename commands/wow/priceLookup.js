const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');

const CLIENT_ID = "c260f00d-1071-409a-992f-dda2e5498536";
const API_KEY = config.tsmAPI;

async function generateAccessToken() {
  try {
    const response = await axios.post('https://auth.tradeskillmaster.com/oauth2/token', {
      client_id: CLIENT_ID,
      grant_type: 'api_token',
      scope: 'app:realm-api app:pricing-api',
      token: API_KEY,
    });

    return response.data.access_token;
  } catch (error) {
    console.error('An error occurred while generating the access token:', error);
    throw error;
  }
}
async function fetchItemId(itemName) {
  try {
    const response = await axios.get(`https://www.wowhead.com/search?q=${encodeURIComponent(itemName)}`);

    const itemIdRegex = /\/item=(\d+)/;
    const itemNameRegex = /\/(\d+)\/(.*?)\?/;
    const itemIdMatch = response.data.match(itemIdRegex);
    const itemNameMatch = response.data.match(itemNameRegex);

    if (itemIdMatch && itemIdMatch[1]) {
      const itemId = itemIdMatch[1];
      const itemName = itemNameMatch && itemNameMatch[2] ? itemNameMatch[2] : null;
      const itemPageUrl = `https://www.wowhead.com/item=${itemId}/${encodeURIComponent(itemName)}`;
      const itemPageResponse = await axios.get(itemPageUrl);
      const iconRegex = /<meta property="og:image" content="https:\/\/wow.zamimg.com\/images\/wow\/icons\/large\/(.*?)\.jpg"/;
      const iconMatch = itemPageResponse.data.match(iconRegex);
      const itemNameIDRegex = /<input type="hidden" name="name" id="name" value="(.*?)"/;
      const itemNameIDMatch = itemPageResponse.data.match(itemNameIDRegex);
      const itemNameID = itemNameIDMatch && itemNameIDMatch[1] ? itemNameIDMatch[1] : null;
      const iconUrl = iconMatch && iconMatch[1] && itemNameID ? `https://wow.zamimg.com/images/wow/icons/large/${itemNameID}.jpg` : null;

      return { itemId, itemName, iconUrl };
    } else {
      throw new Error('Item not found.');
    }
  } catch (error) {
    console.error('An error occurred while fetching the item ID:', error);
    throw error;
  }
}


async function fetchItemPrice(itemId, accessToken) {
  try {
    const response = await axios.get(`https://pricing-api.tradeskillmaster.com/region/1/item/${itemId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('TSM API Response:', response.data); // Log the response object

    const itemData = response.data;
    const avgSalePrice = formatCurrency(itemData.avgSalePrice);
    const soldPerDay = itemData.soldPerDay;

    return { avgSalePrice, soldPerDay };
  } catch (error) {
    console.error('An error occurred while fetching the item price:', error);
    throw error;
  }
}

async function fetchItemPricetwo(itemId, accessToken) {
  try {
    const response = await axios.get(`https://pricing-api.tradeskillmaster.com/ah/1/item/${itemId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });


    const itemData = response.data;
    const minBuyout = itemData.minBuyout !== null && itemData.minBuyout !== undefined ? formatCurrency(itemData.minBuyout) : 'N/A';
    const marketValue = formatCurrency(itemData.marketValue);
    const historical = formatCurrency(itemData.historical);
    const itemString = itemData.itemString ? itemData.itemString.replace(/\r?\n|\r/g, '') : null; // Use null if itemString is undefined

    return { minBuyout, marketValue, historical, itemString };
  } catch (error) {
    console.error('An error occurred while fetching the item price:', error);
    throw error;
  }
}

function formatCurrency(amount, includeCopper = false) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'N/A';
  }

  if (amount === 0) {
    return 'N/A';
  }

  const gold = Math.floor(amount / 10000);
  let silver = Math.floor((amount % 10000) / 100);
  const copper = amount % 100;

  if (copper >= 50) {
    silver++;
  }

  if (includeCopper) {
    return `${gold}g ${silver}s ${copper}c`;
  } else {
    return `${gold}g ${silver}s`;
  }
}


module.exports = {
  data: new SlashCommandBuilder()
    .setName('pricelookup')
    .setDescription('Fetch the price of an item using the TSM API.')
    .addStringOption((option) =>
      option.setName('item').setDescription('The name or ID of the item.').setRequired(true)
    ),
  category: 'wow',
  async execute(interaction) {
    try {
      const accessToken = await generateAccessToken();
      const itemValue = interaction.options.getString('item');

      if (!interaction.deferred) {
        await interaction.deferReply();
      }
      const clientAvatar = interaction.user.displayAvatarURL();

      let itemId;
      let itemName;
      let itemIconUrl = null;

      if (isNaN(itemValue)) {
        // Fetch item ID, name, and icon based on item name
        const itemInfo = await fetchItemId(itemValue);
        itemId = itemInfo.itemId;
        itemName = itemInfo.itemName;
        itemIconUrl = `https://wowhead.com/${itemInfo.iconUrl}`; // Update this line
      
        console.log('itemIconUrl:', itemIconUrl); // Add this line to log the value
      } else {
        // Use the provided item ID directly
        itemId = itemValue;
      }

      const itemPrice = await fetchItemPrice(itemId, accessToken);
      const itemPricetwo = await fetchItemPricetwo(itemId, accessToken);

      const marketValue = itemPricetwo.marketValue;
      const minBuyout = itemPricetwo.minBuyout;
      const historical = itemPricetwo.historical;
      const soldPerDay = itemPrice.soldPerDay;
      const avgSalePrice = itemPrice.avgSalePrice;

      let itemString = '';
      if (itemName) {
        itemString = `Item Name: ${itemName}\n`;
      }

      const priceInfo = `Item ID: ${itemId}:\n\n${itemString}Min Buyout: ${minBuyout}\nMarket Value: ${marketValue}\nHistorical Price: ${historical}\nAverage Sale Price: ${avgSalePrice}\nSold Per Day: ${soldPerDay}`;

      const priceCheckEmbed = {
        color: 0xC95CF3,
        title: 'Item Price Lookup',
        thumbnail: {
          url: itemIconUrl || undefined,
        },
        fields: [
          { name: 'item Value', value: itemValue, inline: false },
          { name: 'Price Value', value: priceInfo, inline: false },
        ],
        timestamp: new Date(),
        footer: {
          text: `Requested by ${interaction.user.username}`,
          icon_url: clientAvatar,
        },
      };
    // Reply with the message embed
    await interaction.editReply({ content: 'Retrieving server information... Done!', embeds: [priceCheckEmbed] });
  } catch (error) {
    console.error(error);
    await interaction.editReply('An error occurred while fetching the item price.');
  }
},
};
