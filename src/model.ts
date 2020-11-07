export enum PersonType {
    patient = 'COVID Case',
    contact = 'COVID Contact'
}

export interface Interview {
    sequenceNumber: number
    calculationNumber: number
    personName: string
    personType: PersonType
    startDate: Date
}
