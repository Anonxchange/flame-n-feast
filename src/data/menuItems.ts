import { MenuItem } from '@/hooks/useCart';
import grilledSteak from '@/assets/grilled-steak.jpg';
import bbqWings from '@/assets/bbq-wings.jpg';
import grilledVegetables from '@/assets/grilled-vegetables.jpg';

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Premium Grilled Steak',
    description: 'Tender ribeye steak grilled to perfection with our signature seasoning',
    price: 2500,
    image: grilledSteak,
    category: 'Steaks',
  },
  {
    id: '2',
    name: 'BBQ Chicken Wings',
    description: 'Smoky chicken wings with our secret BBQ sauce, grilled over open flames',
    price: 1800,
    image: bbqWings,
    category: 'Wings',
  },
  {
    id: '3',
    name: 'Grilled Vegetable Platter',
    description: 'Fresh seasonal vegetables and corn grilled to smoky perfection',
    price: 1200,
    image: grilledVegetables,
    category: 'Vegetables',
  },
  {
    id: '4',
    name: 'Wagyu Beef Burger',
    description: 'Premium wagyu beef patty with caramelized onions and special sauce',
    price: 3200,
    image: grilledSteak,
    category: 'Burgers',
  },
  {
    id: '5',
    name: 'Honey Glazed Ribs',
    description: 'Fall-off-the-bone pork ribs with honey glaze and spices',
    price: 2800,
    image: bbqWings,
    category: 'Ribs',
  },
  {
    id: '6',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with herbs and lemon, grilled to perfection',
    price: 2200,
    image: grilledVegetables,
    category: 'Seafood',
  },
];