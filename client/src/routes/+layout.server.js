import { v4 as uuidv4 } from 'uuid';

export function load({ cookies }) {
    if (!cookies.get('playerID')) {
        cookies.set('playerID', uuidv4(), { path: '/' });
    }
    return {
        playerID: cookies.get('playerID'),
        roomID: cookies.get('roomID')
    }
}
