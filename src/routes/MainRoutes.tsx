import { lazy } from 'react';

// project-imports
import Loadable from 'components/Loadable';
import { SimpleLayoutType } from 'config';
import DashboardLayout from 'layout/Dashboard';
import PagesLayout from 'layout/Pages';
import SimpleLayout from 'layout/Simple';
import DashboardDefault from 'pages/dashboard/default';
import DashboardAnalytics from 'pages/dashboard/analytics';
import DashboardFinance from 'pages/dashboard/finance';

// pages routing
const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/error/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/error/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction/under-construction')));
const MaintenanceUnderConstruction2 = Loadable(lazy(() => import('pages/maintenance/under-construction/under-construction2')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon/coming-soon')));
const MaintenanceComingSoon2 = Loadable(lazy(() => import('pages/maintenance/coming-soon/coming-soon2')));


// pages users
const AppUserList = Loadable(lazy(() => import('pages/apps/user/list')));
const AppUserCard = Loadable(lazy(() => import('pages/apps/user/card')));

// pages banners
const AppBannersList = Loadable(lazy(() => import('pages/apps/banners/list')));

// pages roles
const AppRoleTypesList = Loadable(lazy(() => import('pages/apps/role-types/list')));

// pages tickets
const AppTicketList = Loadable(lazy(() => import('pages/apps/ticket/list')));
const AppTicketDashboard = Loadable(lazy(() => import('pages/apps/ticket/dashboard')));
const AppTicketCreate = Loadable(lazy(() => import('pages/apps/ticket/create')));
const AppTicketDetails = Loadable(lazy(() => import('pages/apps/ticket/details')));
const AppTicketEdit = Loadable(lazy(() => import('pages/apps/ticket/edit')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ContactUS = Loadable(lazy(() => import('pages/contact-us')));

// ==============================|| MAIN ROUTES ||============================== //
const UserProfile = Loadable(lazy(() => import('pages/apps/profiles/user')));
// const UserTabPersonal = Loadable(lazy(() => import('sections/apps/profiles/user/TabPersonal')));
// const UserTabPayment = Loadable(lazy(() => import('sections/apps/profiles/user/TabPayment')));
// const UserTabPassword = Loadable(lazy(() => import('sections/apps/profiles/user/TabPassword')));
// const UserTabSettings = Loadable(lazy(() => import('sections/apps/profiles/user/TabSettings')));

const AccountProfile = Loadable(lazy(() => import('pages/apps/profiles/account')));
const AccountTabProfile = Loadable(lazy(() => import('sections/apps/profiles/account/TabProfile')));
const AccountTabPersonal = Loadable(lazy(() => import('sections/apps/profiles/account/TabPersonal')));
const AccountTabAccount = Loadable(lazy(() => import('sections/apps/profiles/account/TabAccount')));
const AccountTabPassword = Loadable(lazy(() => import('sections/apps/profiles/account/TabPassword')));
const AccountTabRole = Loadable(lazy(() => import('sections/apps/profiles/account/TabRole')));
const AccountTabSettings = Loadable(lazy(() => import('sections/apps/profiles/account/TabSettings')));
const AccountTabEmoji = Loadable(lazy(() => import('sections/apps/profiles/account/TabEmoji')));


const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'dashboard',
          // element: <SamplePage />,
           children: [
            {
              path: 'default',
              element: <DashboardDefault />
            },
            {
              path: 'analytics',
              element: <DashboardAnalytics />
            },
            {
              path: 'finance',
              element: <DashboardFinance />
            }
          ]
        },
        {
          path: 'apps',
          children: [
            
            {
              path: 'user',
              children: [
                {
                  path: 'user-list',
                  element: <AppUserList />
                },
                {
                  path: 'user-card',
                  element: <AppUserCard />
                }
              ]
            },
            {
              path: 'ticket',
              children: [
                {
                  path: 'list',
                  element: <AppTicketList />
                },
                {
                  path: 'dashboard',
                  element: <AppTicketDashboard />
                },
                {
                  path: 'create',
                  element: <AppTicketCreate />
                },
                {
                  path: 'details/:id',
                  element: <AppTicketDetails />
                },
                {
                  path: 'edit/:id',
                  element: <AppTicketEdit />
                }
              ]
            },
            {
              path: 'role-types',
              children: [
                {
                  path: 'list',
                  element: <AppRoleTypesList />
                }
              ]
            },
            {
              path: 'banners',
              children: [
                {
                  path: 'list',
                  element: <AppBannersList />
                }
              ]
            },
           
            {
              path: 'profiles',
              children: [
                {
                  path: 'account',
                  element: <AccountProfile />,
                  children: [
                    {
                      path: 'basic',
                      element: <AccountTabProfile />
                    },
                    {
                      path: 'personal',
                      element: <AccountTabPersonal />
                    },
                    {
                      path: 'my-account',
                      element: <AccountTabAccount />
                    },
                    {
                      path: 'password',
                      element: <AccountTabPassword />
                    },
                    {
                      path: 'role',
                      element: <AccountTabRole />
                    },
                    {
                      path: 'emoji',
                      element: <AccountTabEmoji />
                    },
                    {
                      path: 'settings',
                      element: <AccountTabSettings />
                    }
                  ]
                },
                // {
                //   path: 'user',
                //   element: <UserProfile />,
                //   children: [
                //     {
                //       path: 'personal',
                //       element: <UserTabPersonal />
                //     },
                //     {
                //       path: 'payment',
                //       element: <UserTabPayment />
                //     },
                //     {
                //       path: 'password',
                //       element: <UserTabPassword />
                //     },
                //     {
                //       path: 'settings',
                //       element: <UserTabSettings />
                //     }
                //   ]
                // }
              ]
            },
            
          ]
        },
      ]
    },
    {
      path: '/',
      element: <SimpleLayout layout={SimpleLayoutType.SIMPLE} />,
      children: [
        {
          path: 'contact-us',
          element: <ContactUS />
        }
      ]
    },
    {
      path: '/maintenance',
      element: <PagesLayout />,
      children: [
        {
          path: '404',
          element: <MaintenanceError />
        },
        {
          path: '500',
          element: <MaintenanceError500 />
        },
        {
          path: 'under-construction',
          element: <MaintenanceUnderConstruction />
        },
        {
          path: 'under-construction2',
          element: <MaintenanceUnderConstruction2 />
        },
        {
          path: 'coming-soon',
          element: <MaintenanceComingSoon />
        },
        {
          path: 'coming-soon-2',
          element: <MaintenanceComingSoon2 />
        }
      ]
    },
    { path: '*', element: <MaintenanceError /> }
  ]
};

export default MainRoutes;
