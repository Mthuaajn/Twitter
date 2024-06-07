import databaseService from './db.services';

class SearchService {
  async search({ page, limit, content }: { page: number; limit: number; content: string }) {
    const result = await databaseService.tweets
      .find({ $text: { $search: content } })
      .limit(limit)
      .skip(page * (limit - 1))
      .toArray();
    return result;
  }
}
const searchService = new SearchService();

export default searchService;
