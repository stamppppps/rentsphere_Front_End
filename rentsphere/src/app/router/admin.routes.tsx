import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';

// Lazy load Admin pages
const AddAdmin = lazy(() => import('@/features/Admin/pages/Add_Admin'));
const AllInformation = lazy(() => import('@/features/Admin/pages/All_Information'));
const CheckMitre = lazy(() => import('@/features/Admin/pages/Check_Mitre'));
const PaymentNotification = lazy(() => import('@/features/Admin/pages/PaymentNotification'));
const Report = lazy(() => import('@/features/Admin/pages/Report'));

const SuspenseWrap = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-purple-600">กำลังโหลด...</div>}>
        {children}
    </Suspense>
);

export const adminRoutes: RouteObject[] = [
    {
        path: 'admin',
        children: [
            {
                index: true,
                element: <SuspenseWrap><AllInformation /></SuspenseWrap>,
            },
            {
                path: 'dashboard',
                element: <SuspenseWrap><AllInformation /></SuspenseWrap>,
            },
            {
                path: 'staff',
                element: <SuspenseWrap><AddAdmin /></SuspenseWrap>,
            },
            {
                path: 'meter',
                element: <SuspenseWrap><CheckMitre /></SuspenseWrap>,
            },
            {
                path: 'payment',
                element: <SuspenseWrap><PaymentNotification /></SuspenseWrap>,
            },
            {
                path: 'report',
                element: <SuspenseWrap><Report /></SuspenseWrap>,
            },
        ],
    },
];

export default adminRoutes;
