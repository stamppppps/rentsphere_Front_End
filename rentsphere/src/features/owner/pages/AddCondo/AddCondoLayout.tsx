import { Outlet, matchPath, useLocation, useNavigate } from "react-router-dom";

const MENU = [
    { label: "ค่าบริการ", path: "step-1" },
    { label: "การคิดค่าน้ำ / ค่าไฟ", path: "step-2" },
    { label: "บัญชีธนาคาร", path: "step-3" },
    { label: "จัดการชั้น", path: "step-4" },
    { label: "ผังห้อง", path: "step-5" },
    { label: "ค่าห้อง", path: "step-6" },
    { label: "สถานะห้อง", path: "step-7" },
    { label: "ค่าบริการรายห้อง", path: "step-8" },
];

export default function AddCondoLayout() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const isActive = (stepPath: string) =>
        !!matchPath({ path: `/owner/add-condo/${stepPath}` }, pathname);

    return (
        <div style={styles.page}>
            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <div style={styles.brand}>
                    <div style={styles.logo}>RS</div>
                    <div style={styles.brandText}>RentSphere</div>
                </div>

                <div style={styles.sectionTitle}>คอนโดมิเนียม</div>

                <div style={styles.menuBox}>
                    {MENU.map((m) => {
                        const active = isActive(m.path);

                        return (
                            <button
                                key={m.path}
                                type="button"
                                onClick={() => navigate(m.path, { relative: "path" })}
                                style={{
                                    ...styles.menuItem,
                                    ...(active ? styles.menuItemActive : {}),
                                }}
                            >
                                <span style={styles.menuLabel}>{m.label}</span>
                                {active ? <span style={styles.activeDot} /> : <span style={styles.idleDot} />}
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* Main */}
            <div style={styles.main}>
                {/* Topbar */}
                <div style={styles.topbar}>
                    <div />
                    <div style={styles.user}>Mr. Kittidet Suksarn</div>
                </div>

                {/* Step Content */}
                <div style={styles.content}>
                    <div style={styles.contentInner}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        display: "flex",
        minHeight: "100vh",
        width: "100%",
    },

    sidebar: {
        width: 320,
        padding: 18,
        background:
            "linear-gradient(180deg, rgba(222,202,255,0.92), rgba(154,124,255,0.92))",
        position: "sticky",
        top: 0,
        height: "100vh",
        boxSizing: "border-box",
    },

    brand: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
    },
    logo: {
        width: 38,
        height: 38,
        borderRadius: 12,
        background: "rgba(255,255,255,0.9)",
        fontWeight: 900,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 10px 18px rgba(0,0,0,0.12)",
    },
    brandText: { fontSize: 18, fontWeight: 900, color: "rgba(17,24,39,0.9)" },

    sectionTitle: {
        fontSize: 22,
        fontWeight: 900,
        marginBottom: 12,
        color: "rgba(17,24,39,0.9)",
    },

    menuBox: {
        border: "2px dashed rgba(125,86,205,0.45)",
        borderRadius: 14,
        padding: 14,
        display: "grid",
        gap: 10,
        background: "rgba(255,255,255,0.20)",
    },

    menuItem: {
        height: 46,
        borderRadius: 14,
        border: "1px solid rgba(17,24,39,0.10)",
        background: "rgba(255,255,255,0.10)",
        fontWeight: 800,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        boxSizing: "border-box",
        transition: "all 0.18s ease",
    },
    menuItemActive: {
        background: "rgba(255,255,255,0.62)",
        border: "1px solid rgba(255,255,255,0.70)",
        boxShadow: "0 12px 22px rgba(0,0,0,0.10)",
        transform: "translateY(-1px)",
    },
    menuLabel: {
        fontSize: 13.5,
        color: "rgba(17,24,39,0.85)",
    },
    activeDot: {
        width: 10,
        height: 10,
        borderRadius: 999,
        background: "#22C55E",
        boxShadow: "0 0 0 4px rgba(34,197,94,0.18)",
    },
    idleDot: {
        width: 10,
        height: 10,
        borderRadius: 999,
        background: "rgba(17,24,39,0.20)",
    },

    main: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
    },

    topbar: {
        height: 62,
        background: "#A784FF",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 18px",
        boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
    },
    user: { fontWeight: 800, color: "rgba(17,24,39,0.72)" },

    content: {
        flex: 1,
        padding: 28,
        background:
            "radial-gradient(1200px 600px at 50% 80%, rgba(236,199,255,0.55), transparent 70%), linear-gradient(180deg, rgba(208,212,255,0.65), rgba(255,255,255,0.6))",
        overflow: "auto",
    },

    contentInner: {
        width: "100%",
        maxWidth: 1400,
        margin: "0 auto",
    },

};

