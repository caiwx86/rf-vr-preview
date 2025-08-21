import fs from 'fs';
import path, { resolve } from 'path';
import request from 'request';
import { pictureList } from './source-config.js';
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 确保目录存在
async function ensureDirExists(dir) {
    try {
        const stats = await fs.promises.stat(dir);
        if (stats.isDirectory()) {
            console.log(`目录 ${dir} 已存在`);
            return true;
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            // 递归创建目录
            await fs.promises.mkdir(dir, { recursive: true });
            console.log(`目录 ${dir} 创建成功`);
            return true;
        }
        throw err;
    }
}

// 下载
const download = () => {
    //循环多线程下载
    for (let i = 0; i < pictureList.length; i++) {
        const fileName = [
            'thumb.jpg',
            'preview.jpg',
            'pano_b.jpg',
            'pano_d.jpg',
            'pano_f.jpg',
            'pano_l.jpg',
            'pano_r.jpg',
            'pano_u.jpg',
        ];
        const { tilePath, localName, picTitle } = pictureList[i];
        for (let j = 0; j < fileName.length; j++) {
            // 拼接下载地址
            const url = tilePath + fileName[j];
            console.log('拼接下载地址 - url:', url);
            console.log('目录对应VR名称 - picTitle:', picTitle);
            // 共同目录路径
            const commonDirPath = "public/static/";
            // vr文件路径
            let panosDir = 'panos/my-room/' + localName.split('.')[0] + '.tiles';
            // 获取目录
            const dirPath = path.join(resolve(__dirname, '../..'), commonDirPath + panosDir);
            console.log('获取所有目录 - dirPath:', dirPath);
            ensureDirExists(dirPath).then(exists => {
                console.log('目录是否存在或已创建:', exists);
                if (exists) {
                    if (j === 0) {
                        const xml = `<scene name="scene_${i + 3}" id="${i + 3}" title="${picTitle}" onstart="" thumburl="${panosDir}/thumb.jpg" lat="" lng="" heading="" ><view hlookat="294.2" vlookat="0.0" fovtype="MFOV" fov="120" maxpixelzoom="2.0" fovmin="70" fovmax="140" limitview="auto" /><preview url="${panosDir}/preview.jpg" /><image prealign="0|294.2|0"><cube url="${panosDir}/pano_%s.jpg" /></image></scene>`
                        console.log('创建kPano的XML文件 - xml:', xml);
                        // 拼接XML文件路径
                        let xmlFilePath = dirPath + '/scene.xml';
                        if (!fs.existsSync(xmlFilePath)) {
                            fs.writeFileSync(xmlFilePath, xml, 'utf8');
                        }
                    }
                    const stream = fs.createWriteStream(dirPath + '/' + fileName[j]);
                    request(url).pipe(stream).on("close", function (err) {
                        if (err) {
                            console.log(`【${dirPath}】文件[` + fileName[j] + "]下载失败");
                        }
                        console.log(`【${dirPath}】文件[` + fileName[j] + "]下载完毕");
                    });
                }
            }).catch(err => {
                console.error(err);
            });

        }
    }
}

download();
