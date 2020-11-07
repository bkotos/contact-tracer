export enum PersonType {
    patient = 'Patient',
    contact = 'Contact'
}

export interface Interview {
    sequenceNumber: number
    calculationNumber: number
    personName: string
    personType: PersonType
    startDate: Date
}
