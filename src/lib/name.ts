import {PersonType} from "../model";

export const getQuarantineNameForPersonType = (personType: PersonType): string =>
    personType === PersonType.patient ? 'Isolation' : 'Quarantine'

export const getStartDateNameForPersonType = (personType: PersonType): string =>
    personType === PersonType.patient ? 'Symptomatic OR Test Date' : 'Date of Last Contact'
