import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const BASE_ASSETS_DIR = path.join(process.cwd(), 'src/assets/dishes');
const PUBLIC_ASSETS_DIR = path.join(process.cwd(), 'public/assets/menu');

const categories = [
  {
    id: "starters",
    name: "Starters",
    baseImage: "Snacks/Onion Pakoda.jpg",
    items: [
      { id: "st1", name: "Veg Cutlet" },
      { id: "st2", name: "Spring Roll", baseImage: "Snacks/Samosa.jpg" },
      { id: "st3", name: "Cheese Ball" },
      { id: "st4", name: "Veg Roll" },
      { id: "st5", name: "Paneer Roll", baseImage: "Dinner/Paneer Butter Masala.jpg" },
      { id: "st6", name: "French Fries" },
      { id: "st7", name: "Veg Lollipop" },
      { id: "st8", name: "Veg Vanjaram" },
      { id: "st9", name: "Aloo Tikka" },
      { id: "st10", name: "Cauliflower Chilli" },
      { id: "st11", name: "Smiley Veg" },
      { id: "st12", name: "Mushroom 65" },
      { id: "st13", name: "Baby Corn 65" }
    ]
  },
  {
    id: "bonda-bajji",
    name: "Bonda & Bajji",
    baseImage: "Snacks/Bajji.jpg",
    items: [
      { id: "bb1", name: "Bonda" },
      { id: "bb2", name: "Mysore Bonda" },
      { id: "bb3", name: "Medu Pakoda" },
      { id: "bb4", name: "Masal Bonda" },
      { id: "bb5", name: "Onion Bonda" },
      { id: "bb6", name: "Potato Bonda" },
      { id: "bb7", name: "Raw Banana Bajji" },
      { id: "bb8", name: "Bread Bajji" },
      { id: "bb9", name: "Chilli Bajji" },
      { id: "bb10", name: "Cashew Pakoda" }
    ]
  },
  {
    id: "beverages",
    name: "Beverages",
    baseImage: "Snacks/Filter Coffee.jpg",
    items: [
      { id: "bev1", name: "Tea", baseImage: "Snacks/Masala Tea.jpg" },
      { id: "bev2", name: "Coffee" },
      { id: "bev3", name: "Horlicks" },
      { id: "bev4", name: "Boost" },
      { id: "bev5", name: "Bournvita" },
      { id: "bev6", name: "Chukku Coffee" },
      { id: "bev7", name: "Ragi Malt" },
      { id: "bev8", name: "Badam Milk" },
      { id: "bev9", name: "Welcome Juice", baseImage: "Snacks/Filter Coffee.jpg" },
      { id: "bev10", name: "Fresh Juice" }
    ]
  },
  {
    id: "variety-rice",
    name: "Variety Rice",
    baseImage: "Lunch/Sambar Rice.jpg",
    items: [
      { id: "vr1", name: "Sambar Rice" },
      { id: "vr2", name: "Bisi Bele Bath" },
      { id: "vr3", name: "Tamarind Rice" },
      { id: "vr4", name: "Lemon Rice" },
      { id: "vr5", name: "Bagala Bath" },
      { id: "vr6", name: "Curd Rice", baseImage: "Lunch/Curd Rice.jpg" },
      { id: "vr7", name: "Tomato Rice" },
      { id: "vr8", name: "Veg Biryani", baseImage: "Lunch/Veg Biryani.jpg" },
      { id: "vr9", name: "Veg Pulao", baseImage: "Lunch/Veg Biryani.jpg" },
      { id: "vr10", name: "Mushroom Biryani", baseImage: "Lunch/Veg Biryani.jpg" },
      { id: "vr11", name: "Gobi Rice" },
      { id: "vr12", name: "Mango Rice" },
      { id: "vr13", name: "Coconut Rice", baseImage: "Lunch/Curd Rice.jpg" },
      { id: "vr14", name: "Curry Leaves Rice" },
      { id: "vr15", name: "Pudina Rice" },
      { id: "vr16", name: "Pepper Rice" },
      { id: "vr17", name: "Samba Rice", baseImage: "Lunch/Veg Biryani.jpg" }
    ]
  },
  {
    id: "meals-sides",
    name: "Meals & Sides",
    baseImage: "Lunch/Banana Leaf Meals.jpg",
    items: [
      { id: "ms1", name: "Banana Leaf Meals" },
      { id: "ms2", name: "Rice" },
      { id: "ms3", name: "Sambar", baseImage: "Lunch/Sambar Rice.jpg" },
      { id: "ms4", name: "Vatha Kuzhambu" },
      { id: "ms5", name: "Tomato Rasam" },
      { id: "ms6", name: "Pepper Rasam" },
      { id: "ms7", name: "Pineapple Rasam" },
      { id: "ms8", name: "Garlic Rasam" },
      { id: "ms9", name: "Buttermilk", baseImage: "Lunch/Curd Rice.jpg" },
      { id: "ms10", name: "Poriyal", baseImage: "Lunch/Kootu & Poriyal.jpg" },
      { id: "ms11", name: "Kootu", baseImage: "Lunch/Kootu & Poriyal.jpg" },
      { id: "ms12", name: "Appalam", baseImage: "Lunch/Appalam & Pickle.jpg" },
      { id: "ms13", name: "Pickle", baseImage: "Lunch/Appalam & Pickle.jpg" },
      { id: "ms14", name: "Aviyal", baseImage: "Lunch/Kootu & Poriyal.jpg" },
      { id: "ms15", name: "Potato Chips" },
      { id: "ms16", name: "Banana Chips" },
      { id: "ms17", name: "Tapioca Chips" },
      { id: "ms18", name: "Nendran Chips" },
      { id: "ms19", name: "Beeda" },
      { id: "ms20", name: "Vathal Varieties" },
      { id: "ms21", name: "Lemon Sevai" },
      { id: "ms22", name: "Tamarind Sevai" },
      { id: "ms23", name: "Banana" },
      { id: "ms24", name: "Water Bottle" }
    ]
  },
  {
    id: "vada-varieties",
    name: "Vada Varieties",
    baseImage: "Breakfast/Medu Vada.jpg",
    items: [
      { id: "vd1", name: "Medu Vada" },
      { id: "vd2", name: "Sago Vada" },
      { id: "vd3", name: "Aamai Vada" },
      { id: "vd4", name: "Thavalai Vada" },
      { id: "vd5", name: "Onion Vada" },
      { id: "vd6", name: "Masal Vada", baseImage: "Snacks/Masala Vada.jpg" },
      { id: "vd7", name: "Curd Vada", baseImage: "Lunch/Curd Rice.jpg" },
      { id: "vd8", name: "Keerai Vada" }
    ]
  },
  {
    id: "payasam-varieties",
    name: "Payasam Varieties",
    baseImage: "Sweets/Payasam.jpg",
    items: [
      { id: "py1", name: "Payasam" },
      { id: "py2", name: "Manorama Payasam" },
      { id: "py3", name: "Semiya Payasam" },
      { id: "py4", name: "Aval Payasam" },
      { id: "py5", name: "Sago Payasam" },
      { id: "py6", name: "Semiya Sago Payasam" },
      { id: "py7", name: "Elaneer Payasam" },
      { id: "py8", name: "Betel Leaf Payasam" },
      { id: "py9", name: "Moong Dal Payasam" },
      { id: "py10", name: "Badam Kheer" }
    ]
  },
  {
    id: "indian-breads",
    name: "Indian Breads",
    baseImage: "Dinner/Chapati & Kurma.jpg",
    items: [
      { id: "br1", name: "Chapathi" },
      { id: "br2", name: "Parotta", baseImage: "Dinner/Parotta & Salna.jpg" },
      { id: "br3", name: "Aloo Parotta" },
      { id: "br4", name: "Paneer Parotta" },
      { id: "br5", name: "Phulka Roti" },
      { id: "br6", name: "Rumali Roti" },
      { id: "br7", name: "Butter Naan" },
      { id: "br8", name: "Roti" }
    ]
  },
  {
    id: "gravy-varieties",
    name: "Gravy Varieties",
    baseImage: "Dinner/Paneer Butter Masala.jpg",
    items: [
      { id: "gr1", name: "Chana Masala" },
      { id: "gr2", name: "Paneer Butter Masala" },
      { id: "gr3", name: "Kadai Paneer" },
      { id: "gr4", name: "Gobi Masala" },
      { id: "gr5", name: "Mushroom Masala" },
      { id: "gr6", name: "Dal Makhani" },
      { id: "gr7", name: "Dal Tadka" }
    ]
  },
  {
    id: "halwa-sweets",
    name: "Halwa",
    baseImage: "Sweets/Rava Kesari.jpg",
    items: [
      { id: "hw1", name: "Fruit Halwa" },
      { id: "hw2", name: "Badam Halwa" },
      { id: "hw3", name: "Cashew Halwa" },
      { id: "hw4", name: "Tirunelveli Halwa" },
      { id: "hw5", name: "Tender Coconut Halwa" },
      { id: "hw6", name: "Karupatti Halwa" },
      { id: "hw7", name: "Asoka Halwa" },
      { id: "hw8", name: "Kasi Halwa" },
      { id: "hw9", name: "Wheat Halwa" },
      { id: "hw10", name: "Carrot Halwa" },
      { id: "hw11", name: "Bread Halwa" }
    ]
  },
  {
    id: "sweets",
    name: "Sweets",
    baseImage: "Sweets/Gulab Jamun.jpg",
    items: [
      { id: "sw1", name: "Motichoor Laddu", baseImage: "Sweets/Boondi Laddu.jpg" },
      { id: "sw2", name: "Tirupati Laddu", baseImage: "Sweets/Boondi Laddu.jpg" },
      { id: "sw3", name: "Boondi Laddu", baseImage: "Sweets/Boondi Laddu.jpg" },
      { id: "sw4", name: "Rasgulla" },
      { id: "sw5", name: "Sponge Rasgulla" },
      { id: "sw6", name: "Jangiri", baseImage: "Sweets/Jalebi.jpg" },
      { id: "sw7", name: "Mini Jangiri", baseImage: "Sweets/Jalebi.jpg" },
      { id: "sw8", name: "Kova Jangiri", baseImage: "Sweets/Jalebi.jpg" },
      { id: "sw9", name: "Jalebi", baseImage: "Sweets/Jalebi.jpg" },
      { id: "sw10", name: "Mysore Pak", baseImage: "Sweets/Mysore Pak.jpg" },
      { id: "sw11", name: "Ghee Mysore Pak", baseImage: "Sweets/Mysore Pak.jpg" },
      { id: "sw12", name: "Gulab Jamun" },
      { id: "sw13", name: "Kala Jamun" },
      { id: "sw14", name: "Arcot Jamun" },
      { id: "sw15", name: "Malpua" },
      { id: "sw16", name: "Kaju Peda" },
      { id: "sw17", name: "Malai Rasbhari" },
      { id: "sw18", name: "Agra Paan" },
      { id: "sw19", name: "Mango Roll" },
      { id: "sw20", name: "Pineapple Roll" },
      { id: "sw21", name: "Badam Roll" },
      { id: "sw22", name: "Pista Roll" },
      { id: "sw23", name: "Anarkali" },
      { id: "sw24", name: "Litchi Sweet" },
      { id: "sw25", name: "Basundi", baseImage: "Sweets/Payasam.jpg" },
      { id: "sw26", name: "Chocolate Mysore Pak", baseImage: "Sweets/Mysore Pak.jpg" },
      { id: "sw27", name: "Horlicks Mysore Pak", baseImage: "Sweets/Mysore Pak.jpg" },
      { id: "sw28", name: "Malai Sandwich" },
      { id: "sw29", name: "Pineapple Pudding" },
      { id: "sw30", name: "Ghee Laddu", baseImage: "Sweets/Boondi Laddu.jpg" },
      { id: "sw31", name: "Badam Cassata" },
      { id: "sw32", name: "Malai Cream Roll" },
      { id: "sw33", name: "Cashew Roll" },
      { id: "sw34", name: "Kaju Katli" },
      { id: "sw35", name: "Badam Katli" },
      { id: "sw36", name: "Ajmeri Cake" },
      { id: "sw37", name: "Sweet Pongal", baseImage: "Sweets/Rava Kesari.jpg" },
      { id: "sw38", name: "Kalkandu Rice", baseImage: "Sweets/Rava Kesari.jpg" },
      { id: "sw39", name: "Rava Kesari", baseImage: "Sweets/Rava Kesari.jpg" }
    ]
  },
  {
    id: "tiffin",
    name: "Tiffin",
    baseImage: "Breakfast/Idli & Sambar.jpg",
    items: [
      { id: "tf1", name: "Idli & Sambar" },
      { id: "tf2", name: "Idli" },
      { id: "tf3", name: "Elaneer Idli" },
      { id: "tf4", name: "Mini Idli" },
      { id: "tf5", name: "Kanchipuram Idli" },
      { id: "tf6", name: "Thattu Idli" },
      { id: "tf7", name: "Khushboo Idli" },
      { id: "tf8", name: "Heartin Idli" },
      { id: "tf9", name: "Ghee Podi Dosa", baseImage: "Breakfast/Ghee Podi Dosa.jpg" },
      { id: "tf10", name: "Onion Uthappam", baseImage: "Breakfast/Ghee Podi Dosa.jpg" },
      { id: "tf11", name: "Rava Dosa", baseImage: "Breakfast/Ghee Podi Dosa.jpg" },
      { id: "tf12", name: "Set Dosa", baseImage: "Breakfast/Ghee Podi Dosa.jpg" },
      { id: "tf13", name: "Masal Dosa", baseImage: "Breakfast/Ghee Podi Dosa.jpg" },
      { id: "tf14", name: "Podi Dosa", baseImage: "Breakfast/Ghee Podi Dosa.jpg" },
      { id: "tf15", name: "Ragi Dosa", baseImage: "Breakfast/Ghee Podi Dosa.jpg" },
      { id: "tf16", name: "Wheat Dosa", baseImage: "Breakfast/Ghee Podi Dosa.jpg" },
      { id: "tf17", name: "Millet Dosa Varieties", baseImage: "Breakfast/Ghee Podi Dosa.jpg" },
      { id: "tf18", name: "Pesarattu", baseImage: "Breakfast/Ghee Podi Dosa.jpg" },
      { id: "tf19", name: "Ghee Dosa", baseImage: "Breakfast/Ghee Podi Dosa.jpg" },
      { id: "tf20", name: "Appam", baseImage: "Breakfast/Ghee Podi Dosa.jpg" },
      { id: "tf21", name: "Pongal", baseImage: "Breakfast/Pongal.jpg" },
      { id: "tf22", name: "Rava Pongal", baseImage: "Breakfast/Pongal.jpg" },
      { id: "tf23", name: "Thinai Pongal", baseImage: "Breakfast/Pongal.jpg" },
      { id: "tf24", name: "Poori Masala", baseImage: "Breakfast/Poori Masala.jpg" },
      { id: "tf25", name: "Poori", baseImage: "Breakfast/Poori Masala.jpg" },
      { id: "tf26", name: "Chole Bhature", baseImage: "Breakfast/Poori Masala.jpg" },
      { id: "tf27", name: "Mini Chole Bhature", baseImage: "Breakfast/Poori Masala.jpg" },
      { id: "tf28", name: "Beetroot Poori", baseImage: "Breakfast/Poori Masala.jpg" },
      { id: "tf29", name: "Pudina Poori", baseImage: "Breakfast/Poori Masala.jpg" },
      { id: "tf30", name: "Upma", baseImage: "Breakfast/Upma.jpg" },
      { id: "tf31", name: "Idiyappam", baseImage: "Dinner/Idiyappam.jpg" }
    ]
  },
  {
    id: "accompaniments",
    name: "Accompaniments",
    baseImage: "Lunch/Sambar Rice.jpg",
    items: [
      { id: "ac1", name: "Tiffin Sambar" },
      { id: "ac2", name: "Gothsu" },
      { id: "ac3", name: "Potato Masala" },
      { id: "ac4", name: "Veg Kurma" },
      { id: "ac5", name: "Pakoda Kurma" },
      { id: "ac6", name: "Tomato Thokku" },
      { id: "ac7", name: "Coconut Chutney" },
      { id: "ac8", name: "Kara Chutney" },
      { id: "ac9", name: "Pudina Chutney" },
      { id: "ac10", name: "Peanut Chutney" },
      { id: "ac11", name: "Vadacurry" },
      { id: "ac12", name: "Idli Podi" }
    ]
  },
  {
    id: "special-counters",
    name: "Special Counters",
    baseImage: "Sweets/Gulab Jamun.jpg",
    items: [
      { id: "sp1", name: "Cotton Candy" },
      { id: "sp2", name: "Popcorn", baseImage: "Snacks/Samosa.jpg" },
      { id: "sp3", name: "Fruit Salad", baseImage: "Sweets/Payasam.jpg" },
      { id: "sp4", name: "Ice Varieties" },
      { id: "sp5", name: "Ice Cream Varieties" }
    ]
  }
];

function stringToHash(string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

async function processImages() {
  if (!fs.existsSync(PUBLIC_ASSETS_DIR)) {
    fs.mkdirSync(PUBLIC_ASSETS_DIR, { recursive: true });
  }

  const newMenuCode = `export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

export const categories: Category[] = [
`;

  let menuContent = newMenuCode;
  const promptsData = {};

  for (const category of categories) {
    const categoryDir = path.join(PUBLIC_ASSETS_DIR, category.id);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    menuContent += `  {
    id: "${category.id}",
    name: "${category.name}",
    items: [\n`;

    for (const item of category.items) {
      const baseImagePath = path.join(BASE_ASSETS_DIR, item.baseImage || category.baseImage);
      const outputFilename = `${item.id}.webp`;
      const outputPath = path.join(categoryDir, outputFilename);
      
      const hash = stringToHash(item.id);
      
      const flip = hash % 2 === 0;
      const flop = hash % 3 === 0;
      const hue = (hash % 30) - 15; 
      const brightness = 1 + ((hash % 20) - 10) / 100; 
      
      const scale = 0.8 + ((hash % 20) / 100);

      try {
        const metadata = await sharp(baseImagePath).metadata();
        const w = metadata.width;
        const h = metadata.height;
        
        const cropW = Math.floor(w * scale);
        const cropH = Math.floor(h * scale);
        const left = Math.floor((w - cropW) / 2);
        const top = Math.floor((h - cropH) / 2);

        let img = sharp(baseImagePath)
          .extract({ left, top, width: cropW, height: cropH })
          .resize(800, 600, { fit: 'cover' })
          .modulate({ hue, brightness });
          
        if (flip) img = img.flip();
        if (flop) img = img.flop();
        
        await img.webp({ quality: 80 }).toFile(outputPath);
        
        promptsData[item.id] = `Realistic Indian food photography of ${item.name}. Premium catering presentation, soft natural lighting, clean plate. Highly appetizing.`;
        
        menuContent += `      { id: "${item.id}", name: "${item.name}", categoryId: "${category.id}", image: "/assets/menu/${category.id}/${outputFilename}" },\n`;
        
      } catch (e) {
        console.error("Error processing", item.name, e.message);
      }
    }
    menuContent += `    ]\n  },\n`;
  }
  
  menuContent += `];\n`;
  
  fs.writeFileSync(path.join(process.cwd(), 'src/data/new-menu.ts'), menuContent);
  fs.writeFileSync(path.join(PUBLIC_ASSETS_DIR, 'prompts.json'), JSON.stringify(promptsData, null, 2));
  console.log("Images generated and new menu written.");
}

processImages();
