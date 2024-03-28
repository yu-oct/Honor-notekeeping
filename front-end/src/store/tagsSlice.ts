import { createSlice, PayloadAction, Dispatch } from '@reduxjs/toolkit';
import { RootState } from './reducers';
import { message } from 'antd';

export interface Tag {
    _id: string;
    title: string;
    description: string;
    createdBy: string;
    createdAt: string;
}

interface TagsState {
    tags: Tag[];
    loading: boolean;
    error: string | null;
}

const initialState: TagsState = {
    tags: [],
    loading: false,
    error: null,
};

const tagsSlice = createSlice({
    name: 'tags',
    initialState,
    reducers: {
        fetchTagsStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchTagsSuccess(state, action: PayloadAction<Tag[]>) {
            state.loading = false;
            state.tags = action.payload;
            state.error = null;
        },
        fetchTagsFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        deleteTagStart(state) {
            state.loading = true;
            state.error = null;
        },
        deleteTagSuccess(state, action: PayloadAction<string>) {
            state.loading = false;
            state.tags = state.tags.filter(tag => tag._id !== action.payload);
            state.error = null;
        },
        deleteTagFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        editTagStart(state) {
            state.loading = true;
            state.error = null;
        },
        editTagSuccess(state, action: PayloadAction<Tag>) {
            state.loading = false;
            state.tags = state.tags.map(tag => (tag._id === action.payload._id ? action.payload : tag));
            state.error = null;
        },
        editTagFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    fetchTagsStart,
    fetchTagsSuccess,
    fetchTagsFailure,
    deleteTagStart,
    deleteTagSuccess,
    deleteTagFailure,
    editTagStart,
    editTagSuccess,
    editTagFailure,
} = tagsSlice.actions;

export const fetchTags = (): any => async (dispatch: Dispatch, getState: () => RootState) => {
    try {
        dispatch(fetchTagsStart());
        const token = getState().auth.token;
        const response = await fetch('http://localhost:3001/api/tags', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        if (response.ok) {
            dispatch(fetchTagsSuccess(data.tags));
        } else {
            throw new Error('Failed to fetch tags');
        }
    } catch (error: any) {
        dispatch(fetchTagsFailure(error.message));
    }
};

export const deleteTag = (tagId: string): any => async (dispatch: Dispatch, getState: () => RootState) => {
    try {
        dispatch(deleteTagStart());
        const token = getState().auth.token;
        const response = await fetch(`http://localhost:3001/api/tags/${tagId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (response.ok) {
            dispatch(deleteTagSuccess(tagId));
            dispatch(fetchTags()); // Fetch tags after successful deletion
        } else {
            throw new Error('Failed to delete tag');
        }
    } catch (error: any) {
        dispatch(deleteTagFailure(error.message));
    }
};

export const editTag = (tag: Tag): any => async (dispatch: Dispatch, getState: () => RootState) => {
    try {
        dispatch(editTagStart());
        const token = getState().auth.token;
        const response = await fetch(`http://localhost:3001/api/tags/${tag._id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: tag.title, description: tag.description }),
        });

        if (response.ok) {
            const editedTagData = await response.json();
            message.success('Tag edited successfully');
            dispatch(editTagSuccess(editedTagData));
            dispatch(fetchTags()); // Fetch tags after successful edit
        } else {
            throw new Error('Failed to edit tag');
        }
    } catch (error: any) {
        console.error('Failed to edit tag:', error);
        dispatch(editTagFailure(error.message));
    }
};

export const selectTags = (state: RootState) => state.tags.tags;

export default tagsSlice.reducer;
