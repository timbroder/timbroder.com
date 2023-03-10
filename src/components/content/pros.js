import * as React from "react"
import clsx from 'clsx'

export function Prose({ children, className }) {
    return (
        <div className={clsx(className, 'prose')}>{children}</div>
    )
}
