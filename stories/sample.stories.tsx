import * as React from 'react'

import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'
import { text, boolean, number } from '@storybook/addon-knobs'

storiesOf('Sample', module)
    // Actions
    .add('addon-actions', () => (
        <>
            <div onClick={action('clicked')}>sample action</div>
        </>
    ))
    // link to a story
    .add('addon-links', () => (
        <>
            <a onClick={linkTo('Button')}>sample linkTo</a>
        </>
    ))
    // Knobs
    .add('addon-knobs', () => {
        const name = text('Name', 'Arunoda Susiripala')
        const age = number('Age', 89)

        const content = `I am ${name} and I'm ${age} years old.`
        return (
            <>
                <div>{content}</div>{' '}
                <button disabled={boolean('Disabled', false)}>{text('Label', 'Hello Storybook')}</button>
            </>
        )
    })
