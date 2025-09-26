// assets
import { DocumentText } from 'iconsax-react';

// type
import { NavItemType } from 'types/menu';

// icons
const icons = {
  nonConformities: DocumentText
};

// ==============================|| MENU ITEMS - NON CONFORMITIES ||============================== //

const nonConformitiesMenu: NavItemType = {
  id: 'group-non-conformities',
  title: 'non-conformities',
  type: 'group',
  children: [
    {
      id: 'non-conformities',
      title: 'non-conformities',
      type: 'item',
      icon: icons.nonConformities,
      url: '/apps/non-conformities'
    }
  ]
};

export default nonConformitiesMenu;
