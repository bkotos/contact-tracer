import {PersonType} from "../model";
import {DateTime, DurationObject} from "luxon";

export const formatDate = (date: Date): string =>
    DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)

const getQuarantineDurationForPersonType = (personType: PersonType): DurationObject =>
    ({ days: (personType === PersonType.patient ? 10 : 14) })

export const getFormattedQuarantineDurationForPersonType = (personType: PersonType): string => {
    const { days } = getQuarantineDurationForPersonType(personType)
    return `${days} days`
}

export const getQuarantineEndDate = (startDate: Date, personType: PersonType): Date =>
    DateTime.fromJSDate(startDate).plus(getQuarantineDurationForPersonType(personType)).toJSDate()
