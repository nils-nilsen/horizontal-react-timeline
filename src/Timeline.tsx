import { LeftOutlined } from '@ant-design/icons';
import RightOutlined from '@ant-design/icons/lib/icons/RightOutlined';
import { Button, Col, Row, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';

// Define the structure of a timeline event
interface TimelineEvent {
    date: string; // The date of the event in string format
    name: string; // The name or title of the event
}

// Define the props for the Timeline component
interface TimelineProps {
    events: TimelineEvent[]; // An array of events to be displayed on the timeline
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
    // Sort the events by date in ascending order
    const sortedEvents = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Set initial month and year based on the first event or current date if no events
    const initialMonth = sortedEvents.length > 0 ? new Date(sortedEvents[0].date).getMonth() : new Date().getMonth();
    const initialYear = sortedEvents.length > 0 ? new Date(sortedEvents[0].date).getFullYear() : new Date().getFullYear();

    // State to keep track of the current month and year being displayed
    const [currentMonth, setCurrentMonth] = useState<number>(initialMonth);
    const [displayYear, setDisplayYear] = useState<number>(initialYear);

    // State to control the disabling of previous and next buttons
    const [isPrevDisabled, setIsPrevDisabled] = useState<boolean>(false);
    const [isNextDisabled, setIsNextDisabled] = useState<boolean>(false);

    // State to track hover status for timeline events
    const [hoverStates, setHoverStates] = useState<{ [key: string]: boolean }>({});

    // Handle mouse over and out events to change hover state
    const handleMouseOver = (id: string) => {
        setHoverStates(prev => ({ ...prev, [id]: true }));
    };

    const handleMouseOut = (id: string) => {
        setHoverStates(prev => ({ ...prev, [id]: false }));
    };

    // Function to calculate the number of days in a specific month and year
    const daysInMonth = (month: number, year: number): number => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Check if there are events in the future relative to the currently displayed months
    const checkFutureEvents = () => {
        const lastDisplayMonth = new Date(displayYear, currentMonth + 5);
        return sortedEvents.some(event => new Date(event.date) > lastDisplayMonth);
    };

    // Effect to update button states based on the current timeline view
    useEffect(() => {
        const minEventYear = new Date(sortedEvents[0]?.date || new Date()).getFullYear();
        setIsPrevDisabled(displayYear <= minEventYear && currentMonth <= new Date(sortedEvents[0]?.date || new Date()).getMonth());
        if (!checkFutureEvents()) setIsNextDisabled(true);
    }, [currentMonth, displayYear, sortedEvents]);

    // Function to update the timeline by adding or subtracting months
    const updateTimeline = (monthsToAdd: number) => {
        setCurrentMonth(prevMonth => {
            let newMonth = prevMonth + monthsToAdd;
            let yearAdjustment = 0;

            // Adjust the year if the month index goes beyond 11 or below 0
            if (newMonth >= 12) {
                yearAdjustment = Math.floor(newMonth / 12);
                newMonth %= 12;
            } else if (newMonth < 0) {
                yearAdjustment = Math.ceil(newMonth / 12) - 1;
                newMonth = 12 + (newMonth % 12);
            }

            setDisplayYear(prevYear => prevYear + yearAdjustment);
            return newMonth;
        });
    };

    // Check if the events in a group are close together (within one day)
    const areEventsClose = (eventGroup: TimelineEvent[]): boolean => {
        if (eventGroup.length < 2) return false;
        const dates = eventGroup.map(event => new Date(event.date).getTime());
        dates.sort((a, b) => a - b);
        for (let i = 0; i < dates.length - 1; i++) {
            if ((dates[i + 1] - dates[i]) <= (24 * 60 * 60 * 1000)) {
                return true;
            }
        }
        return false;
    };

    // Render the timeline segments, each representing a month
    const renderTimelineSegments = () => {
        const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

        return Array.from({ length: 6 }).map((_, i) => {
            const segmentMonth = (currentMonth + i) % 12;
            const segmentYear = displayYear + Math.floor((currentMonth + i) / 12);
            const currentYear = new Date().getFullYear();
            const totalDays = daysInMonth(segmentMonth, currentYear);
            const backgroundColor = i % 2 === 0 ? '#3C3C3C' : '#454545';

            // Filter events that occur in the current segment's month and year
            const eventsInMonth = sortedEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getFullYear() === segmentYear && eventDate.getMonth() === segmentMonth;
            });

            // Group events by the specific date
            const groupedEvents = eventsInMonth.reduce((acc, event) => {
                const eventDate = new Date(event.date).toLocaleDateString('de-DE');
                if (!acc[eventDate]) acc[eventDate] = [];
                acc[eventDate].push(event);
                return acc;
            }, {} as { [key: string]: TimelineEvent[] });

            return (
                <Col key={i} span={4} style={{
                    height: '150px',
                    position: 'relative',
                    backgroundColor: backgroundColor
                }}>
                    <div style={{
                        textAlign: 'center',
                        position: 'absolute',
                        top: '10px',
                        width: '100%',
                        color: '#FFE61E'
                    }}>
                        {`${monthNames[segmentMonth]} ${segmentYear}`}
                    </div>

                    {/* Render events for the current month */}
                    {Object.keys(groupedEvents).map((dateKey, index) => {
                        const eventGroup = groupedEvents[dateKey];
                        const leftPercentage = ((new Date(eventGroup[0].date).getDate() / totalDays) * 100).toFixed(2);
                        const hoverId = `event-${segmentYear}-${segmentMonth}-${dateKey}-${index}`;
                        const eventsAreClose = areEventsClose(eventGroup);
                        const displayText = eventsInMonth.length === 1;

                        return (
                            <React.Fragment key={hoverId}>
                                {eventGroup.map((event, idx) => (
                                    <Tooltip
                                        key={`${hoverId}-${idx}`}
                                        title={
                                            <div>
                                                <strong>Scheduled Completion</strong>
                                                <div>Project {event.name}</div>
                                                <div>{dateKey}</div>
                                            </div>
                                        }
                                    >
                                        <div
                                            onMouseOver={() => handleMouseOver(`${hoverId}-${idx}`)}
                                            onMouseOut={() => handleMouseOut(`${hoverId}-${idx}`)}
                                            style={{
                                                position: 'absolute',
                                                zIndex: 2,
                                                left: `${leftPercentage}%`,
                                                top: eventsAreClose ? `calc(77% - ${idx * 12}px)` : '77%',
                                                transform: 'translate(-50%, -50%)',
                                                cursor: 'default',
                                            }}
                                        >
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '50%',
                                                backgroundColor: hoverStates[`${hoverId}-${idx}`] ? 'lightgrey' : '#FFE61E',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)'
                                            }}></div>
                                            {displayText && event.name && !eventsAreClose && (
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '25px',
                                                    width: '100px',
                                                    textAlign: 'center',
                                                    whiteSpace: 'normal',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                                    boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
                                                    color: 'white',
                                                    padding: '2px 5px',
                                                    borderRadius: '3px',
                                                    fontSize: '12px',
                                                }}>
                                                    {event.name}
                                                </div>
                                            )}
                                        </div>
                                    </Tooltip>
                                ))}
                            </React.Fragment>
                        );
                    })}

                    {/* Render the timeline line */}
                    <div style={{
                        position: 'absolute',
                        width: '100%',
                        top: '77%',
                        height: '2px',
                        backgroundColor: 'white',
                        zIndex: 1,
                        transform: 'translateY(-50%)'
                    }}></div>
                </Col>
            );
        });
    };

    return (
        <div style={{ height: '190px', minWidth: '700px' }}>
            <Row gutter={16} style={{ marginBottom: '20px', overflow: 'hidden' }}>
                {renderTimelineSegments()}
            </Row>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '10px' }}>
                <Button icon={<LeftOutlined />} onClick={() => updateTimeline(-6)} ghost type="primary"
                        disabled={isPrevDisabled}></Button>
                <Button icon={<RightOutlined />} onClick={() => updateTimeline(6)} ghost type="primary"
                        style={{ marginLeft: '10px' }} disabled={isNextDisabled}></Button>
            </div>
        </div>
    );
};

export default Timeline;
