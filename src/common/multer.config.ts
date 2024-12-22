import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerConfig = {
    storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads'),
        filename: (req, file, callback) => {
            const uniqueName = `${uuidv4()}-${file.originalname}`;
            callback(null, uniqueName);
        },
    }),
};
