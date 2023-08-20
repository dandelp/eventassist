import { EventFunction } from './types'

const buildRelianceMap = (events: EventFunction[]) => {
    const relianceMap: { [key: string]: string[] } = {}
    events.forEach((event) => {
        if (event.eventToFire) {
            if (!relianceMap[event.eventToFire]) {
                relianceMap[event.eventToFire] = []
            }
            relianceMap[event.eventToFire].push(event.functionName)
        }
    })
    return relianceMap
}

const buildTriggerLevels = (events: EventFunction[]) => {
    const eventTriggers = [
        ...new Set(events.map((event) => event.eventTrigger)),
    ]
    const relianceMap = buildRelianceMap(events)
    const triggerLevels: { [key: string]: number } = {}
    eventTriggers.forEach((trigger) => {
        triggerLevels[trigger] = 0
    })
    let changed = true
    while (changed) {
        changed = false
        eventTriggers.forEach((trigger) => {
            const level = triggerLevels[trigger]
            const eventsThatTriggerReliesOn = relianceMap[trigger]
            if (eventsThatTriggerReliesOn) {
                eventsThatTriggerReliesOn.forEach((event) => {
                    if (triggerLevels[event] < level + 1) {
                        triggerLevels[event] = level + 1
                        changed = true
                    }
                })
            }
        })
    }
    return triggerLevels
}

const parseEvents = (events: EventFunction[]) => {
    const triggerLevels = buildTriggerLevels(events)
    const eventsByTrigger: { [key: string]: EventFunction[] } = {}
    events.forEach((event) => {
        if (!eventsByTrigger[event.eventTrigger]) {
            eventsByTrigger[event.eventTrigger] = []
        }
        eventsByTrigger[event.eventTrigger].push(event)
    })
    Object.keys(eventsByTrigger).forEach((trigger) => {
        eventsByTrigger[trigger].sort((a, b) => {
            return triggerLevels[a.eventToFire] - triggerLevels[b.eventToFire]
        })
    })
    return eventsByTrigger
}

export const outputGherkin = (events: EventFunction[]) => {
    const eventsByTrigger = parseEvents(events)
    console.log('\n***************\nGherkin output:\n***************\n')
    Object.keys(eventsByTrigger).forEach((trigger) => {
        console.log(`When [${trigger}]`)
        const events = eventsByTrigger[trigger]
        events.forEach((event, ix) => {
            if (event.filter && Object.keys(event.filter).length) {
                console.log(
                    ` When ${Object.keys(event.filter).map(
                        (k, ix) =>
                            `${ix > 0 ? 'and ' : ''}${k} is ${
                                event.filter?.[k]
                            }`
                    )}`
                )
                console.log(
                    `   Then ${event.functionName}() and fire [${event.eventToFire}] with ${event.returnType} `
                )
            } else {
                console.log(
                    ` Then ${event.functionName}() and fire [${event.eventToFire}] with ${event.returnType} `
                )
            }
        })
        console.log(`\n`)
    })
}
