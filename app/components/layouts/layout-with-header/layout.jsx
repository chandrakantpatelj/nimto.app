import { useEffect } from 'react';
import { CommonFooter } from '@/components/common/footer';

function LayoutWithHeader({ children }) {
    useEffect(() => {
        const bodyClass = document.body.classList;

        // Add a class to the body element
        bodyClass.add('demo1');
        bodyClass.add('sidebar-fixed');
        bodyClass.add('header-fixed');

        const timer = setTimeout(() => {
            bodyClass.add('layout-initialized');
        }, 1000); // 1000 milliseconds

        // Remove the class when the component is unmounted
        return () => {
            bodyClass.remove('demo1');
            bodyClass.remove('sidebar-fixed');
            bodyClass.remove('sidebar-collapse');
            bodyClass.remove('header-fixed');
            bodyClass.remove('layout-initialized');
            clearTimeout(timer);
        };
    }, []);
    
    return (
        <>
            <div className="custom-wrapper ps-0 flex grow flex-col min-h-screen">
                <main className="grow" role="content">
                    {children}
                </main>
               
            </div>
        </>
    );
}

export default LayoutWithHeader;
