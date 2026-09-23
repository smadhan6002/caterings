import idli from '../assets/dishes/Breakfast/Idli & Sambar.jpg';
import gheePodiDosa from '../assets/dishes/Breakfast/Ghee Podi Dosa.jpg';
import meduVada from '../assets/dishes/Breakfast/Medu Vada.jpg';
import pongal from '../assets/dishes/Breakfast/Pongal.jpg';
import pooriMasala from '../assets/dishes/Breakfast/Poori Masala.jpg';
import upma from '../assets/dishes/Breakfast/Upma.jpg';

import meals from '../assets/dishes/Lunch/Banana Leaf Meals.jpg';
import vegBiryani from '../assets/dishes/Lunch/Veg Biryani.jpg';
import sambarRice from '../assets/dishes/Lunch/Sambar Rice.jpg';
import curdRice from '../assets/dishes/Lunch/Curd Rice.jpg';
import kootuPoriyal from '../assets/dishes/Lunch/Kootu & Poriyal.jpg';
import appalamPickle from '../assets/dishes/Lunch/Appalam & Pickle.jpg';

import chapatiKurma from '../assets/dishes/Dinner/Chapati & Kurma.jpg';
import parottaSalna from '../assets/dishes/Dinner/Parotta & Salna.jpg';
import paneerButterMasala from '../assets/dishes/Dinner/Paneer Butter Masala.jpg';
import friedRice from '../assets/dishes/Dinner/Fried Rice.jpg';
import idiyappam from '../assets/dishes/Dinner/Idiyappam.jpg';
import chickenBiryani from '../assets/dishes/Dinner/Chicken Biryani.jpg';

import gulabJamun from '../assets/dishes/Sweets/Gulab Jamun.jpg';
import mysorePak from '../assets/dishes/Sweets/Mysore Pak.jpg';
import boondiLaddu from '../assets/dishes/Sweets/Boondi Laddu.jpg';
import jalebi from '../assets/dishes/Sweets/Jalebi.jpg';
import payasam from '../assets/dishes/Sweets/Payasam.jpg';
import ravaKesari from '../assets/dishes/Sweets/Rava Kesari.jpg';

import samosa from '../assets/dishes/Snacks/Samosa.jpg';
import onionPakoda from '../assets/dishes/Snacks/Onion Pakoda.jpg';
import bajji from '../assets/dishes/Snacks/Bajji.jpg';
import masalaVada from '../assets/dishes/Snacks/Masala Vada.jpg';
import filterCoffee from '../assets/dishes/Snacks/Filter Coffee.jpg';
import masalaTea from '../assets/dishes/Snacks/Masala Tea.jpg';

export interface MenuItem {
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
  {
    id: "breakfast",
    name: "Breakfast",
    items: [
      { id: "b1", name: "Idli & Sambar", categoryId: "breakfast", image: idli },
      { id: "b2", name: "Ghee Podi Dosa", categoryId: "breakfast", image: gheePodiDosa },
      { id: "b3", name: "Medu Vada", categoryId: "breakfast", image: meduVada },
      { id: "b4", name: "Pongal", categoryId: "breakfast", image: pongal },
      { id: "b5", name: "Poori Masala", categoryId: "breakfast", image: pooriMasala },
      { id: "b6", name: "Upma", categoryId: "breakfast", image: upma },
    ]
  },
  {
    id: "lunch",
    name: "Lunch",
    items: [
      { id: "l1", name: "Banana Leaf Meals", categoryId: "lunch", image: meals },
      { id: "l2", name: "Veg Biryani", categoryId: "lunch", image: vegBiryani },
      { id: "l3", name: "Sambar Rice", categoryId: "lunch", image: sambarRice },
      { id: "l4", name: "Curd Rice", categoryId: "lunch", image: curdRice },
      { id: "l5", name: "Kootu & Poriyal", categoryId: "lunch", image: kootuPoriyal },
      { id: "l6", name: "Appalam & Pickle", categoryId: "lunch", image: appalamPickle },
    ]
  },
  {
    id: "dinner",
    name: "Dinner",
    items: [
      { id: "d1", name: "Chapati & Kurma", categoryId: "dinner", image: chapatiKurma },
      { id: "d2", name: "Parotta & Salna", categoryId: "dinner", image: parottaSalna },
      { id: "d3", name: "Paneer Butter Masala", categoryId: "dinner", image: paneerButterMasala },
      { id: "d4", name: "Fried Rice", categoryId: "dinner", image: friedRice },
      { id: "d5", name: "Idiyappam", categoryId: "dinner", image: idiyappam },
      { id: "d6", name: "Chicken Biryani", categoryId: "dinner", image: chickenBiryani },
    ]
  },
  {
    id: "sweets",
    name: "Sweets",
    items: [
      { id: "sw1", name: "Gulab Jamun", categoryId: "sweets", image: gulabJamun },
      { id: "sw2", name: "Mysore Pak", categoryId: "sweets", image: mysorePak },
      { id: "sw3", name: "Boondi Laddu", categoryId: "sweets", image: boondiLaddu },
      { id: "sw4", name: "Jalebi", categoryId: "sweets", image: jalebi },
      { id: "sw5", name: "Payasam", categoryId: "sweets", image: payasam },
      { id: "sw6", name: "Rava Kesari", categoryId: "sweets", image: ravaKesari },
    ]
  },
  {
    id: "snacks",
    name: "Snacks",
    items: [
      { id: "sn1", name: "Samosa", categoryId: "snacks", image: samosa },
      { id: "sn2", name: "Onion Pakoda", categoryId: "snacks", image: onionPakoda },
      { id: "sn3", name: "Bajji", categoryId: "snacks", image: bajji },
      { id: "sn4", name: "Masala Vada", categoryId: "snacks", image: masalaVada },
      { id: "sn5", name: "Filter Coffee", categoryId: "snacks", image: filterCoffee },
      { id: "sn6", name: "Masala Tea", categoryId: "snacks", image: masalaTea },
    ]
  }
];
