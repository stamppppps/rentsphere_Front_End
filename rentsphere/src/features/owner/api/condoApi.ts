export type ServiceDTO = {
    id: string;
    name: string;
    price: number;
    isVariable: boolean;
    variableType: "NONE" | "WATER" | "ELECTRIC" | "BOTH";
};

// TODO: backendเติม endpoint จริง
export async function listServices(_condoId: string): Promise<ServiceDTO[]> {
    // TODO: GET /condos/:condoId/services
    return [];
}

export async function createService(_condoId: string, _payload: Omit<ServiceDTO, "id">): Promise<ServiceDTO> {
    // TODO: POST /condos/:condoId/services
    // return created service from backend
    return {
        id: "",
        ..._payload,
    };
}