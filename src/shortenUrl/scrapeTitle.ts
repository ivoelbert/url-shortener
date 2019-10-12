import axios from 'axios';
import * as htmlparser from 'htmlparser2';

/*
 *  This code is extremely weird because the logic is very specific
 *  asd
 *
 *  - get the stream from requesting the url
 *  - "pipe" it to the html parser. It's NOT a transform stream, so we can't pipe :(
 *  - wait for 'onopentag' for <title>
 *  - consume the stream appending each chunk to the title being built.
 *  - when we find a 'onclosetag' for </title> close the stream and return the built title.
 *
 *  This is much better than reading the whole html and scraping the title later.
 */

export const getTitle = async (url: string): Promise<string> => {
    try {
        let title: string = null;
        let parsingTitle: boolean = false;
        let finishedParsing: boolean = false;

        const Parser = new htmlparser.Parser(
            {
                onopentag: name => {
                    if (name === 'title') {
                        parsingTitle = true;
                        title = '';
                    }
                },

                ontext: text => {
                    if (parsingTitle) {
                        title += text;
                    }
                },

                onclosetag: tagname => {
                    if (tagname === 'title') {
                        finishedParsing = true;
                        parsingTitle = false;
                    }
                },

                onend: () => {
                    finishedParsing = true;
                    parsingTitle = false;
                },
            },
            { decodeEntities: true }
        );

        // We need to pipe the request to PassThrough cause request doesn't implement [Symbol.asyncIterator]
        const response = await axios({
            method: 'get',
            responseType: 'stream',
            url,
        });

        for await (const chunk of response.data) {
            Parser.write(chunk);

            if (finishedParsing) {
                break;
            }
        }

        return title;
    } catch (err) {
        console.error(`Error getting title for '${url}'`);
        return null;
    }
};
