import { defineComponent, onMounted, onUnmounted, ref, Ref, watch } from "vue";
import DataTable from "./components/dataTable/index.vue";
import UploadMessage from "./components/uploadMessage/index.vue";
import SearchInput from "@libs/p-comps/searchInput/index.vue";
import MultiSelectButton from "./components/multiSelectButton/index.vue";
import Empty from "./components/empty/index.vue";
import GridView from "./components/gridView/index.vue";
import Personalization from "./components/personalization/index.vue";
import CreateMemory from "./components/createMemory/index.vue";
import Tags from "./components/tags/index.vue";
import Paginator from "@libs/p-comps/volt/Paginator.vue";
import { PageState } from "primevue/paginator";
import DropdownMenu from "@libs/p-comps/Dropdown";
import ConfirmDialog from "@libs/p-comps/volt/ConfirmDialog.vue";
import { UploadFileItem, FileStatus } from "./components/uploadMessage/index";
import { FileType, FileItem } from "./components/dataTable/index";
import {
  IconUpload,
  IconMemories,
  IconAdd,
  IconList,
  IconGrid,
  IconTag,
  IconClose,
  IconRecycleBin,
  IconWarning,
  IconCategories,
} from "@quantum/icons";
import { MemoryItem } from "./components/createMemory";
import {
  getAllMemory,
  addDocument,
  getAllDocument,
  getMemory,
  getDocumentByFuzzySearch,
  getAllLabels,
  getAllMemLabels,
  getDocsByLabelId,
  deleteDocument,
  deleteMemory,
} from "@libs/service";
import { useLocale } from "@/hooks/i18n";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import imageUrl from "@/assets/img/memory/dragUpload.svg";
import "./index.less";
import { useFiles } from "@libs/p-comps/hooks/useFiles";
import { changeGlobalStore } from "@/store/global";
import { QButton } from "@libs/p-comps/volt/QButton";
import { Tooltip } from "primevue";

export default defineComponent({
  name: "Memories",
  setup() {
    const { t, locale } = useLocale();

    const toast = useToast();
    const confirm = useConfirm();

    const { files, onFileSelect, onFileclear } = useFiles({
      rules: [
        ".bmp",
        ".jpg",
        ".png",
        ".tif",
        ".gif",
        ".pcx",
        ".tga",
        ".exif",
        ".fpx",
        ".svg",
        ".psd",
        ".cdr",
        ".pcd",
        ".dxf",
        ".ufo",
        ".eps",
        ".ai",
        ".raw",
        ".wmf",
        ".webp",
        ".avif",
        ".apng",
      ],
    });
    const datasource: Ref<Array<FileItem>> = ref([]);

    const unLockedPermissions = ref(true);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    const selectedProducts = ref([]);
    const uploadMessageRef = ref(null);
    const uploadMessageVisible = ref(false);
    const dataTableRef = ref(null);
    const createMemoryRef = ref(null);
    const memoryData: Ref<MemoryItem> = ref();
    const searchValue = ref("");
    const uploadFiles: Ref<Array<UploadFileItem>> = ref([]);
    const promptList: Ref<Array<string>> = ref([]);
    const activeCategorieType = ref(["Memories"]);
    const activeTags = ref([]);
    const tagOptions = ref([]);
    const layout = ref("List");
    const showMultipleBtns = ref(false);
    const categoriesOptions = [
      {
        label: t("FKB.CategoriesRadioMemories"),
        value: "Memories",
        tooltip: t("FKB.CategoriesRadioMemoriesTooltip"),
      },
      {
        label: t("FKB.CategoriesRadioDocuments"),
        value: "Documents",
        tooltip: t("FKB.CategoriesRadioDocumentsTooltip"),
      },
      {
        label: t("FKB.CategoriesRadioAudios"),
        value: "Documents_Audio",
      },
    ];
    const tagsRef = ref();
    const dragAreaRef = ref();

    const showDragArea = (e: Event) => {
      dragAreaRef.value.setAttribute("style", "opacity:1;pointer-events:auto");
    };
    const hideDragArea = (e: Event) => {
      e.preventDefault();
      dragAreaRef.value.setAttribute("style", "opacity:0");
    };

    onMounted(() => {
      window.addEventListener("dragover", showDragArea);
      window.addEventListener("mouseover", hideDragArea);
      getTags();
      init();
    });

    onUnmounted(() => {
      window.removeEventListener("dragover", showDragArea);
      window.removeEventListener("mouseover", hideDragArea);
      changeGlobalStore("gLoading", false);
    });
    const init = async () => {
      selectedProducts.value = [];
      changeGlobalStore("gLoading", true);
      if (activeCategorieType.value.includes("Memories")) {
        const totalRes = await getAllMemory({
          Data: {
            fields: [],
          },
        }).catch((err) => {
          changeGlobalStore("gLoading", false);
        });
        if (totalRes.data.Data.Status === "complete") {
          total.value = JSON.parse(JSON.parse(totalRes.data.Data?.Text).entries).length;
        } else {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: totalRes.data.Data.Text,
            life: 3000,
          });
          changeGlobalStore("gLoading", false);
          return;
        }
        const res = await getAllMemory({
          Data: {
            fields: [
              "id",
              "content",
              "bucket",
              "userText",
              "updateTime",
              "source",
              "tags",
              "contentUri",
            ],
            page_number: currentPage.value - 1,
            page_size: pageSize.value,
          },
        }).catch((err) => {
          changeGlobalStore("gLoading", false);
        });
        if (res.data.Data.Status === "complete") {
          datasource.value =
            JSON.parse(JSON.parse(res.data.Data?.Text).entries).map((item: any) => {
              return {
                id: item.id,
                fileName: item.content,
                editTime: item.updateTime,
                source: item.source,
                type: FileType.MEMORY,
                userText: item.userText,
                bucket: item.bucket,
                tags: item.tags,
              };
            }) || [];
        } else {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: res.data.Data.Text,
            life: 3000,
          });
          changeGlobalStore("gLoading", false);
          return;
        }
      } else if (activeCategorieType.value.find((item) => item.includes("Documents"))) {
        let res = null;
        if (activeTags.value.length > 0) {
          res = await getDocsByLabelId({
            Data: {
              labelIds: activeTags.value,
            },
          }).catch((err) => {
            changeGlobalStore("gLoading", false);
          });
        } else {
          res = await getAllDocument({
            Data: {
              pageNum: currentPage.value,
              pageSize: pageSize.value,
            },
          }).catch((err) => {
            changeGlobalStore("gLoading", false);
          });
        }
        if (res.data.Data.Status === "complete") {
          datasource.value =
            (JSON.parse(res.data.Data?.Text).documentList as unknown as Array<FileItem>) || [];
          total.value = JSON.parse(res.data.Data?.Text).totalSize || 0;
        } else {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: res.data.Data.Text,
            life: 3000,
          });
          changeGlobalStore("gLoading", false);
          return;
        }
      } else {
        datasource.value = [];
      }
      changeGlobalStore("gLoading", false);
    };

    const getTags = async () => {
      const resDoc = await getAllLabels();
      const resMem = await getAllMemLabels({ Data: {} });
      tagOptions.value = [
        ...JSON.parse(resDoc.data.Data?.Text as string).map((item: any) => {
          return { label: item.labelName, value: item.id };
        }),
        ...JSON.parse(JSON.parse(resMem.data.Data?.Text as string).entries),
      ];
    };
    const changeLayout = (str: string) => {
      selectedProducts.value = [];
      layout.value = str;
    };
    const handleUpload = async (uploadfiles?: any) => {
      await onFileSelect();
    };

    const handleAddDocument = async (diff: number) => {
      uploadMessageVisible.value = true;

      for (let i = 0; i < diff; i++) {
        if (i === 0) {
          for (let j = 0; j < diff; j++) {
            let indexInner = files.value.length - 1 - j;
            uploadFiles.value.push({
              filePath: files.value[indexInner].filePath,
              fileName: files.value[indexInner].fileName,
              fileSize: files.value[indexInner].fileSize,
              fileType: files.value[indexInner].fileType,
              convertPath: files.value[indexInner].convertPath,
              converted: files.value[indexInner].converted,
              iconUrl: files.value[indexInner].iconUrl,
              status: FileStatus.UPLOADING,
              message: t("FKB.uploadingMsg"),
              polymeric: false,
            });
          }
          onFileclear();
        }
        let indexOuter = uploadFiles.value.length - 1 - i;
        try {
          let res = await addDocument({
            Data: {
              fileList: [
                {
                  FilePath: uploadFiles.value[indexOuter].filePath,
                },
              ],
            },
          });
          console.log("addDocument", res);
          let result = JSON.parse(res.data.Data?.Text as string);
          if (result[0] === true) {
            uploadFiles.value[indexOuter].status = FileStatus.SUCCESS;
            uploadFiles.value[indexOuter].message = "Upload successful";
            toast.add({
              severity: "success",
              summary: "Success",
              detail: t("FKB.uploadSuccessMsg"),
              life: 3000,
            });
            init();
          } else {
            uploadFiles.value[indexOuter].status = FileStatus.FAIL;
            uploadFiles.value[indexOuter].message = result[0];
            toast.add({
              severity: "error",
              summary: "Error",
              detail: "Upload failed",
              life: 3000,
            });
          }
        } catch (error) {
          uploadFiles.value[indexOuter].status = FileStatus.FAIL;
          uploadFiles.value[indexOuter].message = error;
          toast.add({
            severity: "error",
            summary: "Error",
            detail: error,
            life: 3000,
          });
        }
      }
    };

    const handleCloseUpload = () => {
      uploadMessageVisible.value = false;
      onFileclear();
    };

    const handleCancel = (item: UploadFileItem, index: number) => {
      files.value.splice(index, 1);
      uploadFiles.value.splice(index, 1);
    };

    const handleCreateMemory = () => {
      memoryData.value = undefined;
      createMemoryRef.value.show();
    };

    const showMemory = async (id: string) => {
      const res = await getMemory({ Data: { entries: [id] } });
      memoryData.value = JSON.parse(
        JSON.parse(res.data.Data?.Text as string).entries,
      )[0] as MemoryItem;
      createMemoryRef.value.show();
    };
    const handleManageTag = (data: Array<FileItem>, isAdd: boolean) => {
      tagsRef.value.handleManageTag(data, isAdd);
    };
    const handleMultipleDelete = () => {
      handleDelete(selectedProducts.value);
    };
    const handleDelete = (data: any) => {
      console.log(111, data);
      confirm.require({
        message: t("FKB.tableDeleteMsg"),
        header: t("FKB.tableDeleteTitle"),
        acceptProps: {
          label: t("FKB.tableDeleteBtn"),
          severity: "danger",
          outlined: false,
        },
        rejectProps: {
          label: t("FKB.tableDeleteCancelBtn"),
          severity: "secondary",
          unstyled: true,
        },
        accept: async () => {
          for (let i = 0; i < data.length; i++) {
            changeGlobalStore("gLoading", true);
            if (data[i].type === FileType.MEMORY) {
              const res = await deleteMemory({
                Data: { entries: [data[i].id] },
              });
              console.log("deleteMemory", res);
              if (res.data.Data?.Status === "complete") {
                toast.add({
                  severity: "success",
                  summary: t("FKB.tableDeleteSuccessMsg"),
                  detail: `${data[i].fileName} ${t("FKB.tableDeleteSuccessDetail")}`,
                  life: 3000,
                });
              } else {
                toast.add({
                  severity: "error",
                  summary: "Error",
                  detail: `${data[i].fileName} ${res.data.Data?.Text}`,
                  life: 3000,
                });
              }
              init();
            } else {
              const res = await deleteDocument({
                Data: { doc_ids: [data[i].id] },
              });
              console.log("deleteDocument", res);
              if (JSON.parse(res.data.Data?.Text as string)[0] === true) {
                toast.add({
                  severity: "success",
                  summary: t("FKB.tableDeleteSuccessMsg"),
                  detail: `${data[i].fileName} ${t("FKB.tableDeleteSuccessDetail")}`,
                  life: 3000,
                });
              } else {
                toast.add({
                  severity: "error",
                  summary: "Error",
                  detail: `${data[i].fileName} ${res.data.Data?.Text}`,
                  life: 3000,
                });
              }
              init();
            }
          }
        },
        reject: () => {},
      });
    };
    const handleSearch = async () => {
      promptList.value = [];
      changeGlobalStore("gLoading", true);

      if (activeCategorieType.value.includes("Memories")) {
        const resMemory = await getMemory({
          Data: {
            fuzzySearchText: searchValue.value,
          },
        }).catch((err) => {
          changeGlobalStore("gLoading", false);
        });
        datasource.value =
          JSON.parse(JSON.parse(resMemory.data.Data.Text as string).entries).map((item: any) => {
            return {
              id: item.id,
              fileName: item.content,
              editTime: item.updateTime,
              source: item.source,
              type: FileType.MEMORY,
              userText: item.userText,
              bucket: item.bucket,
              tags: item.tags,
            };
          }) || [];
        total.value = datasource.value.length || 0;
      } else if (activeCategorieType.value.includes("Documents")) {
        const resDocument = await getDocumentByFuzzySearch({
          Data: {
            substring: searchValue.value,
          },
        }).catch((err) => {
          changeGlobalStore("gLoading", false);
        });
        datasource.value =
          (JSON.parse(resDocument.data.Data.Text as string) as unknown as Array<FileItem>) || [];
        total.value = datasource.value.length || 0;
      } else {
        datasource.value = [];
      }
      changeGlobalStore("gLoading", false);
    };

    const onPageChange = (e: PageState) => {
      currentPage.value = e.page + 1;
      init();
    };

    const handleAddTag = () => {
      tagsRef.value.addTag();
    };

    const handleLockingPermissions = () => {
      unLockedPermissions.value = false;
    };

    const handleUnlockingPermissions = () => {
      unLockedPermissions.value = true;
    };

    let searchTimer: number = null;
    watch(
      () => searchValue.value,
      async (val) => {
        if (searchTimer) {
          clearTimeout(searchTimer);
        }
        searchTimer = setTimeout(async () => {
          if (val === promptList.value[0]) {
            promptList.value = [];
            init();
            return;
          }
          if (val) {
            const resMemory = await getMemory({
              Data: {
                fuzzySearchText: val,
              },
            });
            const resDocument = await getDocumentByFuzzySearch({
              Data: {
                substring: val,
              },
            });
            console.log("resMemory", resMemory);
            console.log("resDocument", resDocument);
            const fuzzySearchItems = [
              ...JSON.parse(JSON.parse(resMemory.data.Data.Text as string).entries).map(
                (item: any) => item.shortContent,
              ),
              ...JSON.parse(resDocument.data.Data.Text as string).map((item: any) => item.fileName),
            ];
            promptList.value = fuzzySearchItems;
          } else {
            promptList.value = [];
            init();
          }
        }, 500);
      },
    );

    watch(
      () => selectedProducts.value,
      (selectedProducts) => {
        setTimeout(() => {
          document.querySelectorAll("tr").forEach((item) => {
            item.classList.remove("bg-primary-container");
            if (item.getAttribute("data-p-selected") === "true") {
              item.classList.add("bg-primary-container");
            }
          });
        });
        if (selectedProducts.length) {
          showMultipleBtns.value = true;
        } else {
          showMultipleBtns.value = false;
        }
      },
    );

    watch(
      () => activeCategorieType.value,
      (val) => {
        currentPage.value = 1;
        init();
      },
      { deep: true },
    );

    watch(
      () => activeTags.value,
      (val) => {
        init();
      },
    );

    watch(
      () => files.value,
      (newVal, oldVal) => {
        if (newVal.length > oldVal.length) {
          setTimeout(() => {
            handleAddDocument(newVal.length - oldVal.length);
          }, 1000);
        }
      },
    );
    watch(
      () => uploadFiles.value,
      (val) => {
        if (val.length === 0) {
          handleCloseUpload();
        }
      },
      { deep: true },
    );

    return () => (
      <div class="p-[32px] flex flex-col h-full relative">
        <div class="dragArea" ref={dragAreaRef}>
          <img src={imageUrl} alt="" />
          <span class="title">{t("FKB.dragTitle")}</span>
          <span class="details">{t("FKB.dragDescription")}</span>
        </div>
        <div class="text-headline-s leading-headline-s text-text-on-surface font-bold mb-[8px] -mt-[12px]">
          {t("FKB.pageTitle")}
        </div>
        <div class="text-body-s leading-body-s text-text-on-surface mb-[32px]">
          {t("FKB.pageDescription")}
        </div>
        <div class="flex justify-between relative w-full">
          <div class="w-[650px]">
            <SearchInput
              v-model={searchValue.value}
              promptList={promptList.value}
              placeholder={t("FKB.searchPlaceholder")}
              handleSearch={handleSearch}
            />
          </div>
          <DropdownMenu
            items={[
              {
                label: t("FKB.createTagBtn"),
                icon: IconTag,
                command: () => {
                  handleAddTag();
                },
              },
              {
                label: t("FKB.uploadFilesBtn"),
                icon: IconUpload,
                command: () => {
                  handleUpload();
                },
              },
              {
                label: t("FKB.createMemoryBtn"),
                icon: IconMemories,
                command: () => {
                  handleCreateMemory();
                },
              },
            ]}
          >
            <div class="ml-[8px] flex items-center">
              <QButton
                class="my-[4px]"
                color="primary"
                label={t("FKB.newBtn")}
                v-automation="new_btn"
              >
                {{ icon: () => <IconAdd /> }}
              </QButton>
            </div>
          </DropdownMenu>
        </div>
        <div class="flex justify-between items-center">
          <div class="flex justify-between items-center">
            <MultiSelectButton
              title={t("FKB.CategoriesRadioTitle")}
              titleIcon={IconCategories}
              options={categoriesOptions}
              needAll
              v-model={activeCategorieType.value}
              automationId="categories_selector"
            ></MultiSelectButton>
            <MultiSelectButton
              title={t("FKB.tagsRadioTitle")}
              titleIcon={IconTag}
              options={tagOptions.value}
              v-model={activeTags.value}
              automationId="tag_selector"
            ></MultiSelectButton>
          </div>
          <div class="flex justify-between items-center">
            <div
              class={layout.value === "List" ? "text-primary" : "text-text-on-surface-disabled"}
              onClick={() => {
                changeLayout("List");
              }}
            >
              <IconList class="w-[18px] h-[18px] mr-[20px] cursor-pointer" />
            </div>
            <div
              class={layout.value === "Grid" ? "text-primary" : "text-text-on-surface-disabled"}
              onClick={() => {
                changeLayout("Grid");
              }}
            >
              <IconGrid class="w-[18px] h-[18px] cursor-pointer" />
            </div>
          </div>
        </div>
        <div class="flex items-center mb-[16px]">
          <Personalization
            onMaybeLater={handleLockingPermissions}
            onHandleSync={handleUnlockingPermissions}
            onHandleInit={() => {
              getTags();
              init();
            }}
          />
          <Tags
            ref={tagsRef}
            onCreateTag={getTags}
            tagOptions={tagOptions.value}
            onUpdateTag={init}
          />
        </div>
        {showMultipleBtns.value && (
          <div class="flex items-center justify-between bg-surface p-[8px] rounded-24 mb-[12px]">
            <div class="flex items-center px-[16px] py-[6px] rounded-max border-[1px] border-text-on-surface-variant">
              <IconClose
                class="text-text-on-surface leading-label-s cursor-pointer -ml-[8px] mr-[8px]"
                onClick={() => {
                  selectedProducts.value = [];
                }}
              />
              <span class="text-label-s leading-label-s text-text-on-surface">
                {selectedProducts.value.length} {t("FKB.tableSelected")}
              </span>
            </div>
            <div class="flex items-center">
              <div
                class="flex items-center px-[16px] py-[6px] cursor-pointer rounded-max border-[1px] border-text-on-surface-variant"
                onClick={() => {
                  handleManageTag(selectedProducts.value, true);
                }}
              >
                <span class="text-label-s leading-label-s text-text-on-surface">
                  {t("FKB.tableAddTagsButton")}
                </span>
              </div>
              <IconRecycleBin
                class="text-text-on-surface leading-label-s cursor-pointer ml-[12px] mr-[8px]"
                onClick={() => handleMultipleDelete()}
              />
            </div>
          </div>
        )}
        {unLockedPermissions.value ? (
          datasource.value.length === 0 ? (
            <Empty />
          ) : (
            <div class="mt-6 flex-auto h-[1px]">
              {layout.value === "List" ? (
                <DataTable
                  ref={dataTableRef}
                  datasource={datasource.value}
                  v-model:selection={selectedProducts.value}
                  onRowDblclick={(e) => showMemory(e)}
                  onHandleInit={() => init()}
                  onHandleManageTag={(data) => handleManageTag([data], false)}
                  onHandleDelete={(data) => {
                    handleDelete(data);
                  }}
                />
              ) : (
                <GridView
                  datasource={datasource.value}
                  v-model:selection={selectedProducts.value}
                  onOpenMemory={(e) => showMemory(e)}
                  onHandleManageTag={(data) => handleManageTag([data], false)}
                  onHandleDelete={(data) => {
                    handleDelete(data);
                  }}
                />
              )}
            </div>
          )
        ) : (
          <div></div>
        )}
        {datasource.value.length === 0 ? null : (
          <div class="mt-[12px] -ml-[56px]">
            <Paginator
              totalRecords={total.value}
              rows={pageSize.value}
              onPage={(e) => {
                onPageChange(e);
              }}
            />
          </div>
        )}

        <UploadMessage
          ref={uploadMessageRef}
          visible={uploadMessageVisible.value}
          handleCloseUpload={() => {
            handleCloseUpload();
          }}
          handleCancel={(item: UploadFileItem, index: number) => {
            handleCancel(item, index);
          }}
          files={uploadFiles.value}
        />
        <CreateMemory
          ref={createMemoryRef}
          data={memoryData.value}
          onDeleteMemory={(data) => handleDelete(data)}
          onHandleInit={() => init()}
        />
        <ConfirmDialog>
          {{ iconSlot: () => <IconWarning class="text-warning text-title-xl" /> }}
        </ConfirmDialog>
      </div>
    );
  },
});
