// project-imports
// menu API intentionally unused in this simplified fallback module

// types
import { NavItemType } from 'types/menu';
import {Home} from 'iconsax-react';
// fallback icons are intentionally omitted to reduce unused imports
const icons = {
  dashboard: Home
};
export const loadingMenu: NavItemType = {
  id: 'group-dashboard-loading',
  title: 'Inicio',
  type: 'group',
  url: '/dashboard/default',
  icon: icons.dashboard
  // children: [
  //   {
  //     id: 'dashboard1',
  //     title: 'dashboard',
  //     type: 'collapse',
  //     icon: icons.loading,
  //     children: [
  //       {
  //         id: 'default1',
  //         title: 'loading',
  //         type: 'item',
  //         url: '/dashboard/default',
  //         breadcrumbs: false
  //       },
  //       {
  //         id: 'analytics1',
  //         title: 'loading',
  //         type: 'item',
  //         url: '/dashboard/analytics',
  //         breadcrumbs: false
  //       }
  //     ]
  //   }
  // ]
};

// ==============================|| MENU ITEMS - API ||============================== //

export function MenuFromAPI() {
  // const { menu, menuLoading } = useGetMenu();

  // if (menuLoading) return loadingMenu;

  const subChildrenList = (children: NavItemType[]) => {
    return children?.map((subList: NavItemType) => {
      return fillItem(subList);
    });
  };

  const itemList = (subList: NavItemType) => {
    let list = fillItem(subList);

    // if collapsible item, we need to feel its children as well
    if (subList.type === 'collapse') {
      list.children = subChildrenList(subList.children!);
    }
    return list;
  };

  // const childrenList: NavItemType[] | undefined = menu?.children?.map((subList: NavItemType) => {
  //   return itemList(subList);
  // });

  // let menuList = fillItem(menu, childrenList);
  return [];
  // return menuList;
}

function fillItem(item: NavItemType, children?: NavItemType[] | undefined) {
  return {
    ...item,
    title: item?.title,
    // @ts-ignore
    icon: icons[item?.icon],
    ...(children && { children })
  };
}
