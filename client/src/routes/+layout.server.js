import { v4 as uuidv4 } from 'uuid';

export function load({ cookies }) {
    if (!cookies.get('userID')) {
        cookies.set('userID', uuidv4(), { path: '/' });
    }
    return {
        userID: cookies.get('userID')
    }
}
