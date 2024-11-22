document.getElementById('generate-button').addEventListener('click', async () => {
  const input = document.getElementById('pokemon-input').value.trim().toLowerCase();
  const container = document.getElementById('label-container');
  container.innerHTML = '';

  if (!input) {
    alert('Please enter a Pokémon name or ID.');
    return;
  }

  try {
    // Wait for fonts to load
    await document.fonts.ready;

    // Fetch Pokémon data
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${input}`);
    if (!response.ok) throw new Error('Pokémon not found');
    const data = await response.json();

    // Fetch species data
    const speciesResponse = await fetch(data.species.url);
    const speciesData = await speciesResponse.json();
    const pokedexEntry = speciesData.flavor_text_entries.find(
      (entry) => entry.language.name === 'en'
    )?.flavor_text.replace(/[\n\f]/g, ' ') || 'No Pokédex entry available.';
    const habitat = speciesData.habitat ? speciesData.habitat.name : 'Unknown';
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

    // Calculate text color for front label
    const textColor = getContrastingTextColor(
      types.length === 1 ? getTypeColor(types[0]) : '#FFFFFF'
    );

    // Add Pokémon name
    frontCtx.font = 'bold 48px "Pokemon Emerald"';
    frontCtx.fillStyle = textColor;
    frontCtx.fillText(data.name.toUpperCase(), 20, 50);

    // Add Pokémon number
    frontCtx.font = '36px "Pokemon Emerald"';
    frontCtx.fillText(`Pokédex #: ${data.id}`, 20, 100);

    // Add type badges using images
    let badgeX = 20; // Starting x-position for type badges
    const badgeY = 120;
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

    // Add Pokémon sprite prominently
    const spritePromise = new Promise((resolve) => {
      const sprite = new Image();
      sprite.src = data.sprites.front_default;
      sprite.onload = () => {
        frontCtx.drawImage(sprite, 580, 20, 220, 220); // Larger sprite

        // Add height and weight
        frontCtx.font = '28px "Pokemon Emerald"';
        frontCtx.fillStyle = textColor;
        frontCtx.fillText(`Height: ${data.height / 10} m`, 20, 200);
        frontCtx.fillText(`Weight: ${data.weight / 10} kg`, 20, 230);
        resolve();
      };
    });

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

    // Calculate text color for back label
    const backTextColor = getContrastingTextColor(
      types.length === 1 ? getTypeColor(types[0]) : '#FFFFFF'
    );

    // Add Pokémon classification
    backCtx.font = 'italic 28px "Pokemon Emerald"';
    backCtx.fillStyle = backTextColor;
    backCtx.fillText(classification, 20, 40);

    // Add Pokédex entry
    backCtx.font = 'italic 24px "Pokemon Emerald"';
    const wrappedText = wrapText(backCtx, pokedexEntry, 20, 80, 680, 30);
    wrappedText.forEach((line, index) => {
      backCtx.fillText(line, 20, 80 + index * 30);
    });

    // Add habitat
    const habitatY = 80 + wrappedText.length * 30 + 20;
    backCtx.font = '28px "Pokemon Emerald"';
    backCtx.fillStyle = backTextColor;
    backCtx.fillText(`Habitat: ${habitat.toUpperCase()}`, 20, habitatY);

    // Add QR code for cry
    const qrSize = 80;
    const qrX = backLabel.width - qrSize - 20;
    const qrY = habitatY - qrSize + 10; // Align with habitat
    const cryUrl = `https://play.pokemonshowdown.com/audio/cries/${data.name.toLowerCase()}.mp3`;
    const qr = new QRious({
      value: cryUrl,
      size: qrSize,
    });
    const qrImg = new Image();
    qrImg.src = qr.toDataURL();
    qrImg.onload = () => {
      backCtx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Append the back label
      container.appendChild(backLabel);
    };
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
  const rgb = parseInt(hex.substring(1), 16); // Convert hex to RGB
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;

  // Calculate brightness using the formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Return black for bright colors and white for dark colors
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
