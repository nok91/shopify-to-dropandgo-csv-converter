import React from 'react'
import {Button} from 'react-aria-components';
import Spinner from '@/components/spinner/spinner'

type Props = {
    children: React.ReactNode,
    pending?: boolean,
    onPress?: () => {},
    disabled?: boolean,
    submit?: boolean,
}
export default function button(props: Props) {
    const pending = props.pending || false
    const disabled = props.disabled || pending

    return (
        <Button
            {...(props.submit ? { type: 'submit' } : {})}
            onPress={props.onPress}
            isDisabled={disabled}
        >
            {pending ? <Spinner/> : props.children }
        </Button>
    )
}