import classNames from "classnames";

export const Page = ({ className, children }) => {
    return (
        <div className={
            classNames(
                "wppw-page", 
                className,
                "nfd-flex nfd-flex-col nfd-gap-8",
            )
        }>
            {children}
        </div>
    );
}