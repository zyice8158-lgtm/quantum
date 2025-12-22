import { defineComponent } from 'vue';
import { SvgIcon } from '../../../Icons';
import { FileTypeIcon } from "../../../iconDocument";

export default defineComponent({
    name: 'DragFileView',
    props: {
        fileList: {
            type: Array<{ filePath: string; fileName: string; }>,
            default: () => { },
        },
    },
    setup(props) {
        return () => {
            props.fileList.map(item => {
                return (
                    <>
                        <FileTypeIcon size="15" filename={item.fileName } />
                        <div class="file-name">{ item.fileName }</div>
                        <SvgIcon size="15" name="close"/>

                    </>

                )

            })

        }
    }
})
