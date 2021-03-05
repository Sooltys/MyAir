export interface SensorsAPI {
    id: number,
    stationId: number,
    param: {
        paramName: string,
        paramFormula: string,
        paramCode: string,
        idParam: number
    }
}