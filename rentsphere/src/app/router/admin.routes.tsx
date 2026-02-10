import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// Lazy load Admin pages
const AddAdmin = lazy(() => import('@/features/Admin/pages/Add_Admin'));
const AllInformation = lazy(() => import('@/features/Admin/pages/All_Information'));
const CheckMitre = lazy(() => import('@/features/Admin/pages/Check_Mitre'));
const PaymentNotification = lazy(() => import('@/features/Admin/pages/PaymentNotification'));
const Report = lazy(() => import('@/features/Admin/pages/Report'));

export const adminRoutes: RouteObject[] = [
    {
        path: 'admin',
        children: [
            {
                index: true,
                element: <AllInformation />,
            },
            {
                path: 'dashboard',
                element: <AllInformation />,
            },
            {
                path: 'staff',
                element: <AddAdmin />,
            },
            {
                path: 'meter',
                element: <CheckMitre />,
            },
            {
                path: 'payment',
                element: <PaymentNotification />,
            },
            {
                path: 'report',
                element: <Report />,
            },
        ],
    },
];

export default adminRoutes;
