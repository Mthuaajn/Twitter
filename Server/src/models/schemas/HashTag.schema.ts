import { ObjectId } from 'mongodb';

interface HashTagType {
  _id: ObjectId;
  name: string;
  create_at: Date;
}

export class HashTag {
  _id?: ObjectId;
  name: string;
  create_at?: Date;
  constructor({ _id, name, create_at }: HashTagType) {
    this._id = _id || new ObjectId();
    this.name = name;
    this.create_at = create_at || new Date();
  }
}
