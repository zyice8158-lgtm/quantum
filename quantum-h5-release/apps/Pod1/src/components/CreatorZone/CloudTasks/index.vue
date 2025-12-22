<template>
  <div class="cloud-task"></div>
</template>

<script setup lang="ts">
import { inject, onMounted, Ref } from 'vue'
import {
  GenBtnStatus,
  SESSIONID_PROMPT_MAX_LENGTH,
  getLocalBaseModelGenImageSize,
  CloudTaskStatus,
} from '@/constant'
import { IreadFileRes, RATIO, IMAGE_STATUS } from '@/types'
import { localBaseModel } from '@/cs/genImages'
import { imageBase64ToFile } from '@/services/CreatorZone/file'
import { getFileObjectKey } from '@/services/CreatorZone/oss'
import { getCloudTasks, updateCloudTask } from '@/services/CreatorZone/tasks'

const init = async () => {
  // 本地任务 id 对应云端任务 id
  const cloudTaskId = window.sessionStorage.getItem(String(localBaseModel.taskId))

  // pageLoading = !!cloudTaskId

  const res = await getCloudTasks()

  if (res?.success) {
    const cloudTasks = (res?.data || []).reverse()

    for (let index = 0; index < cloudTasks.length; index++) {
      const cloudTask = cloudTasks[index]

      if (cloudTask.taskStatus === CloudTaskStatus.CANCELLING) {
        if (cloudTask.taskId === cloudTaskId) {
          if (localBaseModel.status === GenBtnStatus.RUNNING) {
            // 取消本地生图任务
            const res = await localBaseModel.cancel()

            // 取消云端生图任务
            await updateCloudTask({
              taskId: cloudTask.taskId,
              taskStatus: CloudTaskStatus.CANCELLED,
            })

            res.callback()
          }
        } else {
          // 取消云端生图任务
          await updateCloudTask({
            taskId: cloudTask.taskId,
            taskStatus: CloudTaskStatus.CANCELLED,
          })
        }
      } else if (
        [CloudTaskStatus.CREATED, CloudTaskStatus.READY, CloudTaskStatus.RUNNING].includes(
          cloudTask.taskStatus
        )
      ) {
        if (localBaseModel.status === GenBtnStatus.INIT) {
          const {
            content = '',
            ratioId = RATIO.ONE_ONE,
            imageStyleList = [],
          } = cloudTask?.generationParamVO

          const { width, height } = getLocalBaseModelGenImageSize(ratioId, RATIO)

          const localTaskId = new Date().getTime()

          window.sessionStorage.setItem(String(localTaskId), cloudTask.taskId)

          let generationResultList = []
          let images = []
          let locked = false

          const res = await localBaseModel.create({
            taskId: localTaskId,
            prompt: content.slice(0, SESSIONID_PROMPT_MAX_LENGTH),
            stylePrompt: imageStyleList?.[0]?.styleName,
            width,
            height,
            runningCallback: async (res) => {
              const _images = (res?.data?.imgOutputPath || []).filter((image) => image)

              const _generationResultList = await getGenerationResultList(
                _images.filter((image) => !images.includes(image))
              )

              if (locked) {
                return
              }

              generationResultList = [...generationResultList, ..._generationResultList]

              await updateCloudTask({
                taskId: cloudTask.taskId,
                taskStatus: CloudTaskStatus.RUNNING,
                content: content.slice(0, SESSIONID_PROMPT_MAX_LENGTH),
                ratioId,
                width,
                height,
                generationResultList,
              })

              images = _images
            },
          })

          locked = true

          if (res.dispatcher === 'cz.image.cancel') {
            return
          }

          generationResultList = [
            ...generationResultList,
            ...(await getGenerationResultList(
              (res?.data?.imgOutputPath || []).filter((image) => !images.includes(image))
            )),
          ]

          await updateCloudTask({
            taskId: cloudTask.taskId,
            taskStatus:
              generationResultList.length > 0
                ? CloudTaskStatus.SUCCESSFULLY
                : CloudTaskStatus.FAILED,
            content: content.slice(0, SESSIONID_PROMPT_MAX_LENGTH),
            ratioId,
            width,
            height,
            generationResultList,
          })

          res.callback()
        }
      }
    }
  }
}

const getGenerationResultList = (images) => {
  return Promise.all(
    images.map(async (image) => {
      if (image) {
        const base64 = ((await readFileReq(image)) as IreadFileRes).content

        const objectKey = await getFileObjectKey({
          fileType: base64.split(';')[0].split(':')[1].split('/')[1],
          file: await imageBase64ToFile(base64),
        })

        return {
          resultStatus: IMAGE_STATUS.SUCCESSFULLY,
          objectKey,
          seed: 0,
        }
      }

      return {
        resultStatus: IMAGE_STATUS.FAILED,
        objectKey: '',
        seed: 0,
      }
    })
  )
}

onMounted(() => {
  window.setInterval(() => {
    init()
  }, 800)
})
</script>

<style lang="less" scoped></style>
