let pokemonList = [];

// Fetch all Pokémon names on page load
async function fetchPokemonList() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1008');
    const data = await response.json();
    pokemonList = data.results.map((pokemon) => pokemon.name);
  } catch (error) {
    console.error('Error fetching Pokémon list:', error);
  }
}

// Call this function to populate the list on page load
fetchPokemonList();
const input = document.getElementById('pokemon-input');
const autocompleteList = document.getElementById('autocomplete-list');

// Listen for input changes to populate suggestions
input.addEventListener('input', () => {
  const query = input.value.toLowerCase().trim();
  autocompleteList.innerHTML = ''; // Clear any existing suggestions

  if (!query) return; // Exit if input is empty

  // Filter Pokémon names based on input and show the first 10 matches
  const matches = pokemonList.filter((name) => name.startsWith(query)).slice(0, 10);

  matches.forEach((name) => {
    const listItem = document.createElement('li');
    listItem.textContent = capitalizeFirstLetter(name);
    listItem.classList.add('autocomplete-item');

    // Fill input when suggestion is clicked
    listItem.addEventListener('click', () => {
      input.value = capitalizeFirstLetter(name);
      autocompleteList.innerHTML = ''; // Clear suggestions
    });

    autocompleteList.appendChild(listItem);
  });
});

// Helper function to capitalize names
function capitalizeFirstLetter(str) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

document.getElementById('generate-button').addEventListener('click', async () => {
  const input = document.getElementById('pokemon-input').value.trim().toLowerCase();
  const container = document.getElementById('label-container');
  container.innerHTML = '';

  if (!input) {
    alert('Please enter a Pokémon name or ID.');
    return;
  }

  try {
    // Load the custom font explicitly
    const font = new FontFace('Pokemon Emerald', 'url(./assets/pokemon-emerald.ttf)');
    await font.load();
    document.fonts.add(font);

    // Wait for fonts to load
    await document.fonts.ready;

    // Fetch Pokémon data
    // Normalize input for special cases like "Mr. Mime" and "Type: Null"
    const formattedName = input.toLowerCase().replace(/[\s:]/g, '-');
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${formattedName}`);

    if (!response.ok) throw new Error('Pokémon not found');
    const data = await response.json();

    // Fetch species data
    const speciesResponse = await fetch(data.species.url);
    const speciesData = await speciesResponse.json();
    const pokedexEntry = speciesData.flavor_text_entries.find(
      (entry) => entry.language.name === 'en'
    )?.flavor_text.replace(/[\n\f]/g, ' ') || 'No Pokédex entry available.';
    // Fetch Pokémon catch rate
    const catchRate = speciesData.capture_rate || 'Unknown';

    const classification = speciesData.genera.find(
      (genus) => genus.language.name === 'en'
    )?.genus || 'Unknown Pokémon';

    // Pokémon type(s)
    const types = data.types.map((t) => t.type.name.toLowerCase());

    // Front Label
    const frontLabel = document.createElement('canvas');
    frontLabel.width = 825;
    frontLabel.height = 237;
    const frontCtx = frontLabel.getContext('2d');

    // Fill background with type gradient
    frontCtx.fillStyle = getTypeGradient(frontCtx, types);
    frontCtx.fillRect(0, 0, frontLabel.width, frontLabel.height);

    // Add a 3mm black border (approximately 9px)
    frontCtx.lineWidth = 9; // Border thickness
    frontCtx.strokeStyle = '#000'; // Black border color
    frontCtx.strokeRect(4.5, 4.5, frontLabel.width - 9, frontLabel.height - 9);

    // Calculate text color for front label
    const textColor = getContrastingTextColor(
      types.length === 1 ? getTypeColor(types[0]) : '#FFFFFF'
    );

// Add a background to the Pokémon name
// Calculate a contrasting background color for the Pokémon name
let nameBackgroundColor;
if (types.length === 1) {
  // Single type: lighten or darken the type color
  const baseColor = getTypeColor(types[0]);
  nameBackgroundColor = adjustColorBrightness(baseColor, -20); // Darken by 20%
} else {
  // Dual types: calculate an average color
  const color1 = getTypeColor(types[0]);
  const color2 = getTypeColor(types[1]);

  // Convert HEX to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  // Average the RGB values
  const avgR = Math.floor((rgb1.r + rgb2.r) / 2);
  const avgG = Math.floor((rgb1.g + rgb2.g) / 2);
  const avgB = Math.floor((rgb1.b + rgb2.b) / 2);

  // Convert RGB back to HEX
  nameBackgroundColor = rgbToHex(avgR, avgG, avgB);
}

frontCtx.fillStyle = nameBackgroundColor;

// Measure the name text width dynamically
frontCtx.font = 'bold 48px "Pokemon Emerald"';
const textWidth = frontCtx.measureText(data.name.toUpperCase()).width;

// Dynamically adjust the background size
const nameBoxX = 20; // X position
const nameBoxY = 20; // Y position
const nameBoxWidth = textWidth + 20; // Add padding
const nameBoxHeight = 60; // Fixed height
const borderRadius = 10;

// Draw the rounded rectangle
frontCtx.beginPath();
frontCtx.moveTo(nameBoxX + borderRadius, nameBoxY);
frontCtx.lineTo(nameBoxX + nameBoxWidth - borderRadius, nameBoxY);
frontCtx.quadraticCurveTo(nameBoxX + nameBoxWidth, nameBoxY, nameBoxX + nameBoxWidth, nameBoxY + borderRadius);
frontCtx.lineTo(nameBoxX + nameBoxWidth, nameBoxY + nameBoxHeight - borderRadius);
frontCtx.quadraticCurveTo(nameBoxX + nameBoxWidth, nameBoxY + nameBoxHeight, nameBoxX + nameBoxWidth - borderRadius, nameBoxY + nameBoxHeight);
frontCtx.lineTo(nameBoxX + borderRadius, nameBoxY + nameBoxHeight);
frontCtx.quadraticCurveTo(nameBoxX, nameBoxY + nameBoxHeight, nameBoxX, nameBoxY + nameBoxHeight - borderRadius);
frontCtx.lineTo(nameBoxX, nameBoxY + borderRadius);
frontCtx.quadraticCurveTo(nameBoxX, nameBoxY, nameBoxX + borderRadius, nameBoxY);
frontCtx.closePath();
frontCtx.fill();

// Add a thin black border
frontCtx.lineWidth = 2; // Thin border
frontCtx.strokeStyle = '#000'; // Black color
frontCtx.stroke();

// Add Pokémon name text on top of the background
frontCtx.fillStyle = getContrastingTextColor(nameBackgroundColor); // Ensure text is readable
frontCtx.fillText(data.name.toUpperCase(), nameBoxX + 10, nameBoxY + 45); // Position text with padding



    // Add Pokémon number
    frontCtx.font = '36px "Pokemon Emerald"';
    frontCtx.fillText(`Pokédex #: ${data.id}`, 30, 115);

    // Add type badges using images
    let badgeX = 26; // Starting x-position for type badges
    const badgeY = 130;
    const badgePromises = types.map((type) => {
      return new Promise((resolve) => {
        const badgeImage = new Image();
        badgeImage.src = `./assets/${type}.png`; // Path to the type badge image
        badgeImage.onload = () => {
          frontCtx.drawImage(badgeImage, badgeX, badgeY, 100, 30); // Adjust size and position
          badgeX += 110; // Adjust for next badge
          resolve();
        };
      });
    });

    // Add Pokémon sprite
    const spritePromise = new Promise((resolve) => {
      const sprite = new Image();
      sprite.src = data.sprites.front_default;
      sprite.onload = () => {
        const spriteWidth = sprite.naturalWidth;
        const spriteHeight = sprite.naturalHeight;
        const scaleFactor = 220 / spriteWidth; // Scale width to 220px

        // Maintain aspect ratio by scaling height proportionally
        const scaledWidth = spriteWidth * scaleFactor;
        const scaledHeight = spriteHeight * scaleFactor;

      // Add shadow to the sprite
frontCtx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black shadow
frontCtx.shadowBlur = 15; // Amount of blur
frontCtx.shadowOffsetX = 5; // Horizontal offset
frontCtx.shadowOffsetY = 5; // Vertical offset

// Draw the Pokémon sprite
frontCtx.drawImage(sprite, 560, 20, scaledWidth, scaledHeight);

// Reset shadow settings to avoid affecting other elements
frontCtx.shadowColor = 'transparent';
frontCtx.shadowBlur = 0;
frontCtx.shadowOffsetX = 0;
frontCtx.shadowOffsetY = 0;

        resolve();
      };
    });

    // Add height and weight
    frontCtx.font = '28px "Pokemon Emerald"';
    frontCtx.fillStyle = textColor;
    frontCtx.fillText(`Height: ${data.height / 10} m`, 30, 186);
    frontCtx.fillText(`Weight: ${data.weight / 10} kg`, 30, 215);

    // Wait for type badges and sprite to load
    await Promise.all([...badgePromises, spritePromise]);

    // Append the front label
    container.appendChild(frontLabel);

    // Back Label
    const backLabel = document.createElement('canvas');
    backLabel.width = 825;
    backLabel.height = 237;
    const backCtx = backLabel.getContext('2d');

    // Fill background with type gradient
    backCtx.fillStyle = getTypeGradient(backCtx, types);
    backCtx.fillRect(0, 0, backLabel.width, backLabel.height);

    // Add a 3mm black border (approximately 9px)
    backCtx.lineWidth = 9; // Border thickness
    backCtx.strokeStyle = '#000'; // Black border color
    backCtx.strokeRect(4.5, 4.5, backLabel.width - 9, backLabel.height - 9);

    // Calculate text color for back label
    const backTextColor = getContrastingTextColor(
      types.length === 1 ? getTypeColor(types[0]) : '#FFFFFF'
    );

    // Add Pokémon classification
    backCtx.font = 'italic 28px "Pokemon Emerald"';
    backCtx.fillStyle = backTextColor;
    backCtx.fillText(classification, 30, 40);

    // Add Pokédex entry
    backCtx.font = 'italic 24px "Pokemon Emerald"';
    const wrappedText = wrapText(backCtx, pokedexEntry, 30, 80, backLabel.width - 140, 30);
    wrappedText.forEach((line, index) => {
      backCtx.fillText(line, 30, 80 + index * 30);
    });

    // Position catch rate closer to the bottom
const catchRateY = backLabel.height - 40; // Final position
backCtx.font = '28px "Pokemon Emerald"';
backCtx.fillStyle = backTextColor;
const catchRateX = 30; // Align to the left
backCtx.fillText(`Catch Rate: ${catchRate}`, catchRateX, catchRateY);




    // Add QR code for cry
    const qrSize = 80;
    // Adjust QR code position to accommodate the back sprite
    const qrX = 20; // Move QR code to the bottom-left
    const qrY = backLabel.height - qrSize - 20; // Align with the bottom edge


    const cryUrl = `https://play.pokemonshowdown.com/audio/cries/${data.name.toLowerCase()}.mp3`;
    const qr = new QRious({
      value: cryUrl,
      size: qrSize,
    });
    const qrImg = new Image();
    qrImg.src = qr.toDataURL();
    qrImg.onload = async () => {
      backCtx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      await backSpritePromise; // Ensure the back sprite loads before appending
      container.appendChild(backLabel);
    };
    

    // Add back sprite to the back label
    const backSpritePromise = new Promise((resolve) => {
    const backSprite = new Image();
    backSprite.src = data.sprites.back_default;
    backSprite.onload = () => {
    const spriteWidth = backSprite.naturalWidth;
    const spriteHeight = backSprite.naturalHeight;
    const scaleFactor = 120 / spriteWidth; // Scale width to 120px

    // Maintain aspect ratio by scaling height proportionally
    const scaledWidth = spriteWidth * scaleFactor;
    const scaledHeight = spriteHeight * scaleFactor;

    // Add shadow to the back sprite
    backCtx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black shadow
    backCtx.shadowBlur = 15; // Amount of blur
    backCtx.shadowOffsetX = 5; // Horizontal offset
    backCtx.shadowOffsetY = 5; // Vertical offset

    // Draw the back sprite
    const spriteScaleFactor = 220 / backSprite.naturalWidth; // Same size as front sprite
    const spriteScaledWidth = backSprite.naturalWidth * spriteScaleFactor;
    const spriteScaledHeight = backSprite.naturalHeight * spriteScaleFactor;

    backCtx.drawImage(backSprite, backLabel.width - spriteScaledWidth - 20, 20, spriteScaledWidth, spriteScaledHeight);




    // Reset shadow settings
    backCtx.shadowColor = 'transparent';
    backCtx.shadowBlur = 0;
    backCtx.shadowOffsetX = 0;
    backCtx.shadowOffsetY = 0;

    resolve();
  };
});

  } catch (error) {
    alert(error.message);
  }
});


// Helper function to get type colors
function getTypeColor(type) {
  const typeColors = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
  };
  return typeColors[type] || '#FFFFFF';
}

// Helper function to get gradient background based on types
function getTypeGradient(ctx, types) {
  const colors = types.map((type) => getTypeColor(type));
  if (colors.length === 1) {
    return colors[0]; // Single type
  }
  const gradient = ctx.createLinearGradient(0, 0, 825, 0);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  return gradient;
}

// Helper function to calculate contrasting text color
function getContrastingTextColor(hex) {
  const rgb = parseInt(hex.substring(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000' : '#fff';
}

// Text wrapping function
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const testLine = `${line}${word} `;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth) {
      lines.push(line.trim());
      line = `${word} `;
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  return lines;
}

// Convert HEX color to RGB
function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

// Convert RGB color to HEX
function rgbToHex(r, g, b) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}


// Adjust brightness of a HEX color
function adjustColorBrightness(hex, percent) {
  const rgb = hexToRgb(hex);
  const adjust = (value) => Math.min(255, Math.max(0, value + Math.round((percent / 100) * 255)));
  const r = adjust(rgb.r);
  const g = adjust(rgb.g);
  const b = adjust(rgb.b);
  return rgbToHex(r, g, b);
}

