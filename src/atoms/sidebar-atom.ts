import { atom } from 'recoil';

export interface SidebarState {
    isOpen: boolean;
    isMobileOpen?: boolean;
}

const sidebarAtom = atom<SidebarState>({
    key: 'sidebarAtom',
    default: {
        isOpen: true,
        isMobileOpen: false,
    },
});

export default sidebarAtom;
