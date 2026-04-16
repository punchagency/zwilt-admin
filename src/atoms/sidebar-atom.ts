import { atom } from 'recoil';

export interface SidebarState {
    isOpen: boolean;
}

const sidebarAtom = atom<SidebarState>({
    key: 'sidebarAtom',
    default: {
        isOpen: true,
    },
});

export default sidebarAtom;
