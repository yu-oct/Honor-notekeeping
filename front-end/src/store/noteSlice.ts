import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './reducers';

interface NoteState {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    lastModifiedAt: string;
    userId: string;
    tagId: string;
    image: string;
    isPublic: Boolean;
    reviewed:Boolean
}

const initialState: NoteState = {
    _id: '',
    title: '',
    content: '',
    createdAt: '',
    lastModifiedAt: '',
    userId: '',
    tagId: '',
    image: '',
    isPublic: false,
    reviewed:false
};

const noteSlice = createSlice({
    name: 'note',
    initialState,
    reducers: {
        updateNote: (state, action: PayloadAction<NoteState>) => {
            return {
                ...state,
                ...action.payload
            };
        }
    }
});


export const { updateNote } = noteSlice.actions;

export const selectNote = (state: RootState) => state.note;

export default noteSlice.reducer;
