import * as shortid from 'shortid';

/*
 *   This is more like a mocked service.
 *
 *   In case we need some distributed architecture,
 *   or if we're dealing with a huge number of reqs/s
 *   we should have a way of getting true unique ids every time.
 *
 *   Some considerations:
 *   - Hashing URL is nice, but collisions will eventually appear if you truncate the hash to a short string.
 *   - A counter service would be nice too, URLS would look sequential, but why not.
 *
 *   To keep this simplified we'll generate ids with a little node package for that.
 *   This is not ideal for a much bigger application.
 */

const getUniqueShortId = async (): Promise<string> => {
    return shortid.generate();
};

export default getUniqueShortId;
