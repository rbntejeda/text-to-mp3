const fs = require('fs')
const util = require('util')
const textToSpeech = require('@google-cloud/text-to-speech')
const papaparse = require('papaparse')

const client = new textToSpeech.TextToSpeechClient();
const inputFileName = './assets/data.csv';
const outputDir = './assets'

const app = async () => {
    var csvText = fs.readFileSync(inputFileName, { encoding: "UTF8" });
    var { data } = papaparse.parse(csvText.trim(), { header: true, skipEmptyLines: true, error: (err) => { throw (err) } })
    await Promise.all(data.map((x) => RequestTexToMp3(x)));
}

const RequestTexToMp3 = async (data) => {
    console.log(data)
    const request = {
        input: {
            text: data.text
        },
        voice: {
            languageCode: data.lang,
            ssmlGender: data.gender
        },
        audioConfig: {
            audioEncoding: 'MP3'
        },
    };
    const [response] = await client.synthesizeSpeech(request);
    const outputFile = `${outputDir}/${data.output}.mp3`;
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(outputFile, response.audioContent, 'binary');
    console.log(`Audio content written to file: ${outputFile}`);
}

app()
    .then(() => console.log("Ha terminado con exito"))
    .catch((err) => console.error(err));