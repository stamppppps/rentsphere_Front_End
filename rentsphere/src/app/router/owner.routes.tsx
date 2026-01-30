import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import OwnerLayout from "@/app/layouts/OwnerLayout";
import AddCondoLayout from "@/features/owner/pages/AddCondo/AddCondoLayout";

import Step6RoomPrice from "@/features/owner/pages/AddCondo/steps/Step6_RoomPrice";
import Step7Review from "@/features/owner/pages/AddCondo/steps/Step7_Review";
import Step8Success from "@/features/owner/pages/AddCondo/steps/Step8_Success";

import Step_3 from "@/features/owner/pages/Step_3";
import Step_4 from "@/features/owner/pages/Step_4";
import Step_5 from "@/features/owner/pages/Step_5";


const ownerRoutes: RouteObject[] = [
    {
        path: "/owner",
        element: <OwnerLayout />,
        children: [
            { index: true, element: <Navigate to="add-condo/step-6" replace /> },

            { path: "add-condo-test", element: <Navigate to="add-condo/step-6" replace /> },

            {
                path: "add-condo",
                element: <AddCondoLayout />,
                children: [
                    { index: true, element: <Navigate to="step-6" replace /> },

                    { path: "step-3", element: <Step_3 /> },
                    { path: "step-4", element: <Step_4 /> },
                    { path: "step-5", element: <Step_5 /> },

                    { path: "step-6", element: <Step6RoomPrice /> },
                    { path: "step-7", element: <Step7Review /> },
                    { path: "step-8", element: <Step8Success /> },
                ],
            },
        ],
    },
];

export default ownerRoutes;
