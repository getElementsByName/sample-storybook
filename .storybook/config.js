import { configure, addDecorator } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'

// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /\.stories\.(ts|tsx|js|jsx)$/)
function loadStories() {
    req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
addDecorator(withKnobs)
