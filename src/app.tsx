import React, {useEffect, useState} from 'react'
import {FormGroup, InputGroup, Card, Button, RadioGroup, Radio} from "@blueprintjs/core"
import styled from "styled-components"
import {DateInput, DateRangePicker} from "@blueprintjs/datetime"
import {PersonType} from "./model"
import {getQuarantineNameForPersonType, getStartDateNameForPersonType} from "./lib/name"
import {formatDate, getFormattedQuarantineDurationForPersonType, getQuarantineEndDate} from "./lib/date"

const Container = styled.div`
    padding: 0 2rem;
`

const Row = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
`

const Column = styled.div`
    display: flex;
    flex-direction: column;
    flex-basis: 100%;
    flex: 1;
    padding: 0 1rem;
`

const FullWidthFormGroup = styled(FormGroup)`
    .bp3-popover-wrapper, .bp3-popover-target, .bp3-input-group, .bp3-select {
        display: flex;
        width: 100%;
    }
`

const SpacedCard = styled(Card)`
    margin-bottom: 2rem;
`

const Attribution = styled.p`
    margin: 1rem;
    position: absolute;
    bottom: 0;
    right: 0;
    font-size: 9pt;
`

const DEFAULT_PERSON_TYPE = PersonType.patient

const APP_TITLE = 'COVID Quarantine/Isolation Calculator'

export default () => {
    const [personType, setPersonType] = useState<PersonType>(DEFAULT_PERSON_TYPE)
    const [quarantineName, setQuarantineName] = useState<string>(getQuarantineNameForPersonType(personType))
    const [showQuarantineInfo, setShowQuarantineInfo] = useState<boolean>(false)

    const [startDate, setStartDate] = useState<Date|null>(null)
    const [formattedStartDate, setFormattedStartDate] = useState<string>('')

    const [endDate, setEndDate] = useState<Date|null>(null)
    const [formattedEndDate, setFormattedEndDate] = useState<string>('')

    const reset = () => {
        setStartDate(null)
        setEndDate(null)
    }

    useEffect(() => {
        document.title = APP_TITLE
    }, [])
    useEffect(() => {
        setFormattedStartDate(formatDate(startDate as Date))
        setEndDate(getQuarantineEndDate(startDate as Date, personType))
        setShowQuarantineInfo(!!startDate)
    }, [startDate])
    useEffect(() => setFormattedEndDate(formatDate(endDate as Date)), [endDate])
    useEffect(() => {
        const hasStartDate = !!startDate
        setEndDate(hasStartDate ? getQuarantineEndDate(startDate as Date, personType) : null)
        setQuarantineName(getQuarantineNameForPersonType(personType))
    }, [personType])

    return (
        <Container>
            <h1>{APP_TITLE}</h1>
            <SpacedCard>
                <Row>
                    <Column>
                        <RadioGroup
                            inline
                            label='Who are you interviewing?'
                            selectedValue={personType}
                            onChange={e => setPersonType(e.currentTarget.value as PersonType)}
                        >
                            {
                                Object.values(PersonType)
                                    .map((value, i) =>
                                        <Radio label={value} value={value} key={i} />
                                    )
                            }
                        </RadioGroup>
                    </Column>
                    <Column>
                        <FullWidthFormGroup
                            label={`${getStartDateNameForPersonType(personType)} Date`}
                        >
                            <DateInput
                                formatDate={() => formattedStartDate}
                                parseDate={str => new Date(str)}
                                maxDate={new Date()}
                                value={startDate}
                                onChange={
                                    (date: Date) => setStartDate(date)
                                }
                                disabled={showQuarantineInfo}
                            />
                        </FullWidthFormGroup>
                    </Column>
                </Row>
            </SpacedCard>
            {
                showQuarantineInfo &&
                <>
                    <SpacedCard>
                        <Row>
                            <Column>
                                <FormGroup label={`${quarantineName} Duration`}>
                                    <InputGroup
                                        value={getFormattedQuarantineDurationForPersonType(personType)}
                                        disabled
                                    />
                                </FormGroup>
                            </Column>
                            <Column>
                                <FormGroup label={`${quarantineName} Start Date`}>
                                    <InputGroup value={formattedStartDate} disabled />
                                </FormGroup>
                            </Column>
                            <Column>
                                <FormGroup label={`${quarantineName} End Date`}>
                                    <InputGroup value={formattedEndDate} disabled />
                                </FormGroup>
                            </Column>
                        </Row>
                        <Row>
                            <Column>
                                <DateRangePicker
                                    shortcuts={false}
                                    value={[ startDate, endDate ]}
                                />
                            </Column>
                        </Row>
                    </SpacedCard>
                    <SpacedCard>
                        <Row>
                            <Column>
                                <Button large intent='primary' icon='add' onClick={reset}>
                                    New Calculation
                                </Button>
                            </Column>
                        </Row>
                    </SpacedCard>
                </>
            }
            <Attribution>
                Created by <a href='https://kotos.io' target='_blank'>Brian Kotos</a>
            </Attribution>
        </Container>
    )
}
