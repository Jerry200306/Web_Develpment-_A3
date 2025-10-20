const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images', 'events');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('✅ Created images/events directory');
}


for (let i = 1; i <= 7; i++) {
  const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'];
  const eventNames = [
    'Coastal Run',
    'Gala Dinner', 
    'Rock Concert',
    'Art Auction',
    'Workshop',
    'Community Fair',
    'Moonlight Marathon'
  ];
  

  const svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${colors[i-1]}"/>
    <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="20" font-family="Arial">
      ${eventNames[i-1]}
    </text>
    <text x="50%" y="60%" text-anchor="middle" fill="white" font-size="16" font-family="Arial">
      Event ${i}
    </text>
  </svg>`;
  
  fs.writeFileSync(path.join(imagesDir, `${i}.svg`), svgContent);
  

  fs.writeFileSync(path.join(imagesDir, `${i}.jpg`), '');
  
  console.log(`✅ Created placeholder: ${i}.svg and ${i}.jpg`);
}

console.log('🎉 All placeholder images created!');
console.log('📍 Access them at: http://localhost:3000/images/events/1.jpg etc.');