# Horizontal Timeline Component for React

I couldn't find a simple, minimalist horizontal timeline for React. The good ones are all vertical. So I made my own.


## Installation

```bash
npm install react-timeline-component
```
## Usage

```jsx
import Timeline from 'react-timeline-component';

const events = [
    { date: '2024-08-24', name: 'Event 1' },
    { date: '2024-09-12', name: 'Event 2' },
    // more events...
];

function App() {
    return <Timeline events={events} />;
}
