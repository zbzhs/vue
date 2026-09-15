<template>
  <section class="admin-product-tools">
    <template v-if="activeTool === 'menu'">
      <header class="admin-section-head product-tool-menu-head">
        <div>
          <p>PRODUCT TOOLS</p>
          <h2>商品工具</h2>
        </div>
      </header>

      <nav class="admin-tool-entry-grid" aria-label="商品维护功能">
        <button
          v-for="item in toolTabs"
          :key="item.key"
          type="button"
          class="admin-tool-entry"
          @click="openTool(item.key)"
        >
          <span>{{ item.label }}</span>
          <small>{{ item.description }}</small>
        </button>
      </nav>
    </template>

    <header v-else class="admin-section-head product-tool-view-head">
      <div>
        <p>PRODUCT TOOLS</p>
        <h2>{{ activeToolMeta.label }}</h2>
      </div>
      <button class="admin-refresh" type="button" @click="openTool('menu')">返回商品工具</button>
    </header>

    <p v-if="activeTool !== 'menu' && notice" class="product-tool-notice" :class="{ error: noticeType === 'error' }">{{ notice }}</p>

    <template v-if="activeTool === 'create'">
    <section class="product-tool-panel product-create-entry-module">
      <div class="product-tool-panel-head">
        <div><span>上新商品</span><h3 class="product-module-title"><span class="product-module-index">1</span>录入商品资料</h3></div>
        <div class="product-create-mode" aria-label="上新方式">
          <button type="button" :class="{ active: createMode === 'excel' }" @click="selectCreateMode('excel')">Excel 导入</button>
          <button type="button" :class="{ active: createMode === 'history' }" @click="selectCreateMode('history')">历史上传记录</button>
        </div>
      </div>
      <div v-if="createMode === 'excel'" class="product-import-workspace">
        <input ref="excelFileInput" class="product-import-file-input" type="file" accept=".xlsx,.xlsm" @change="handleExcelFile" />
        <div class="product-import-upload">
          <div>
            <strong>上传 Excel 商品表</strong>
            <small>支持 .xlsx、.xlsm，首个有效工作表最多 2,000 行</small>
          </div>
          <button class="product-tool-primary" type="button" :disabled="isParsingExcel" @click="excelFileInput?.click()">
            {{ isParsingExcel ? '读取中...' : (importPreview ? '重新选择' : '选择文件') }}
          </button>
        </div>

        <template v-if="importPreview">
          <div class="product-import-summary">
            <span><strong>{{ importPreview.fileName }}</strong>{{ importPreview.sheetName }}</span>
            <span>{{ importPreview.rowCount }} 行商品</span>
          </div>

          <div class="product-import-section-head">
            <div><strong>自动识别结果</strong><small>Excel 列将写入以下数据库参数</small></div>
          </div>
          <div class="product-import-map-summary">
            <span v-for="fieldItem in finalPreviewFields" :key="fieldItem.key">
              <strong>{{ sourceDescription(fieldItem.key) }}</strong><i>写入</i>{{ fieldItem.label }}
            </span>
          </div>

          <p v-if="importPreview.salesPriceOnly && !importMapping.labelPrice" class="product-import-price-note">
            表格只有销售价。直播价按销售价写入，最高标签价当前按销售价 {{ importPriceMode === 'sales_x4' ? '× 4' : '原值' }} 写入。
          </p>

          <div class="product-import-section-head">
            <div><strong>待入库数据</strong><small>显示前 8 行，共 {{ importPreview.rowCount }} 行</small></div>
          </div>
          <div class="product-import-table-wrap">
            <table class="product-import-table">
              <thead><tr><th>Excel 行</th><th v-for="fieldItem in finalPreviewFields" :key="fieldItem.key">{{ fieldItem.label }}</th></tr></thead>
              <tbody>
                <tr v-for="row in importPreview.rows.slice(0, 8)" :key="row._rowNumber">
                  <td>{{ row._rowNumber }}</td>
                  <td v-for="fieldItem in finalPreviewFields" :key="fieldItem.key">{{ displayCell(finalImportValue(row, fieldItem.key)) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <button class="product-tool-primary" type="button" :disabled="isImporting" @click="beginImport">
            {{ isImporting ? '上传中...' : `查看并确认上传 ${importPreview.rowCount} 行` }}
          </button>
        </template>
      </div>

      <section v-else class="product-import-history product-import-history--standalone">
        <div class="product-import-section-head">
          <div><strong>历史上传记录</strong><small>最近通过 Excel 插入 jewelry_product_db.product 表的数据</small></div>
          <button type="button" :disabled="isLoadingHistory" @click="loadImportHistory">{{ isLoadingHistory ? '刷新中...' : '刷新' }}</button>
        </div>
        <div v-if="importHistory.length" class="product-import-table-wrap">
          <table class="product-import-table product-import-history-table">
            <thead><tr><th>导入时间</th><th>来源</th><th>Excel 行</th><th>商品款号</th><th>商品名称</th><th>直播价</th><th>最高标签价</th><th>导入人</th></tr></thead>
            <tbody>
              <tr v-for="item in importHistory" :key="item.id">
                <td>{{ formatImportTime(item.importedAt) }}</td>
                <td><strong>{{ item.sourceFile }}</strong><small>{{ item.sourceSheet }}</small></td>
                <td>{{ item.sourceRow }}</td><td>{{ item.styleNo }}</td><td>{{ item.name || '—' }}</td>
                <td>{{ formatPrice(item.livePrice) }}</td><td>{{ formatPrice(item.labelPrice) }}</td><td>{{ item.adminNickname || item.adminId }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="product-tool-empty">{{ isLoadingHistory ? '正在加载导入历史...' : '暂无 Excel 导入记录' }}</p>
      </section>

    </section>

    <section class="product-tool-panel product-white-image-module">
      <div class="product-tool-panel-head">
        <div><h3 class="product-module-title"><span class="product-module-index">2</span>处理图片</h3></div>
        <div class="product-create-mode" aria-label="图片处理方式">
          <button type="button" :class="{ active: imageProcessMode === 'white-background' }" @click="imageProcessMode = 'white-background'">白底图</button>
          <button type="button" :class="{ active: imageProcessMode === 'cutout' }" @click="imageProcessMode = 'cutout'">自动抠图</button>
        </div>
      </div>

      <div v-if="imageProcessMode === 'white-background'" class="product-image-process-workspace">
        <input
          ref="whiteImageInput"
          class="product-import-file-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          webkitdirectory=""
          directory=""
          :disabled="isGeneratingWhiteImage"
          @change="handleWhiteImageSelection"
        />
        <input
          ref="whiteImageFilesInput"
          class="product-import-file-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          :disabled="isGeneratingWhiteImage"
          @change="handleWhiteImageSelection"
        />
        <div class="product-image-process-upload">
          <div>
            <strong>批量上传商品图片</strong>
            <small>一次选择包含多个款号文件夹的总目录；每个子文件夹名作为款号，每款可有多张参考图，最多 8 款</small>
          </div>
          <div class="product-image-process-upload-actions">
            <button
              class="product-tool-primary"
              type="button"
              :disabled="isGeneratingWhiteImage || whiteBatches.length >= 8"
              @click="whiteImageInput?.click()"
            >
              {{ whiteBatches.length ? `添加款号文件夹（还可选 ${8 - whiteBatches.length} 款）` : '选择 8 个款号文件夹' }}
            </button>
            <button
              type="button"
              :disabled="isGeneratingWhiteImage"
              @click="whiteImageFilesInput?.click()"
            >
              添加图片
            </button>
            <button v-if="whiteBatches.length" type="button" :disabled="isGeneratingWhiteImage" @click="clearWhiteImageFiles">清空</button>
          </div>
        </div>

        <div v-if="whiteBatches.length" class="product-image-process-batches">
          <article v-for="(batch, batchIndex) in whiteBatches" :key="batch.styleNo" class="product-image-process-batch">
            <div class="product-image-process-batch-head">
              <strong>{{ batch.styleNo }}</strong>
              <span>{{ batch.files.length }} 张图片</span>
              <span v-if="batch.status">{{ whiteBatchStatusLabel(batch) }} · {{ batch.progress || 0 }}%</span>
              <button type="button" :disabled="isGeneratingWhiteImage" @click="removeWhiteBatch(batchIndex)">删除款号</button>
            </div>
            <code v-if="batch.outputDirectory" class="product-image-process-batch-path">{{ batch.outputDirectory }}</code>
            <small v-if="batch.error" class="product-image-process-batch-error">{{ batch.error }}</small>
            <div class="product-image-process-selection">
              <article v-for="(item, index) in batch.files" :key="item.id">
                <div class="product-image-process-thumb">
                  <img :src="item.previewUrl" :alt="item.file.name" />
                  <span>{{ index === 0 ? '主商品图' : `参考图 ${index}` }}</span>
                </div>
                <div>
                  <strong>{{ item.file.name }}</strong>
                  <small>{{ formatFileSize(item.file.size) }}</small>
                </div>
                <div class="product-image-process-item-actions">
                  <button v-if="index > 0" type="button" :disabled="isGeneratingWhiteImage" @click="setWhiteMainImage(batchIndex, index)">设为主图</button>
                  <button type="button" :disabled="isGeneratingWhiteImage" @click="removeWhiteImage(batchIndex, index)">删除</button>
                </div>
              </article>
            </div>
          </article>
        </div>

        <div v-if="whiteBatches.length" class="product-image-process-actions">
          <button class="product-tool-primary" type="button" :disabled="isGeneratingWhiteImage" @click="generateWhiteBackgroundImage">
            {{ isGeneratingWhiteImage ? '正在批量生成...' : `一键生成 ${whiteBatches.length} 个款号` }}
          </button>
          <span>{{ whiteBatches.length }} 个款号 · {{ whiteTotalImageCount }} 张参考图 · 每个款号单独保存到以款号命名的文件夹</span>
        </div>

        <div v-if="whiteTaskStatus" class="product-image-process-progress" :class="{ error: whiteTaskStatus === 'failed' }">
          <div><strong>{{ whiteTaskStatusText }}</strong><span>{{ whiteProgress }}%</span></div>
          <div class="product-image-process-progress-track"><i :style="{ width: `${whiteProgress}%` }"></i></div>
          <small v-if="whiteTaskError">{{ whiteTaskError }}</small>
        </div>

        <section v-if="whiteResults.length" class="product-image-process-results">
          <div class="product-import-section-head">
            <div><strong>生成结果</strong><small>保存到 D:\DERING\white-background-images\款号，文件夹名称就是款号</small></div>
          </div>
          <div class="product-image-process-result-grid">
            <article v-for="item in whiteResults" :key="`${item.styleNo}-${item.filename}`">
              <img :src="item.previewUrl" :alt="item.filename" />
              <div><strong>{{ item.styleNo }} · {{ item.label || item.filename }}</strong><small>{{ item.width }} × {{ item.height }} · {{ item.savedPath }}</small></div>
              <button class="product-tool-primary" type="button" @click="downloadWhiteResult(item)">下载图片</button>
            </article>
          </div>
        </section>
      </div>

      <div v-if="imageProcessMode === 'cutout'" class="product-image-process-workspace product-cutout-workspace">
        <input
          ref="cutoutImageInput"
          class="product-import-file-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          :disabled="isCuttingOut"
          @change="handleCutoutImageSelection"
        />
        <div class="product-image-process-upload">
          <div>
            <strong>上传需要自动抠图的图片</strong>
            <small>使用本机 GemCutout 的 BiRefNet 模型生成透明 PNG，一次最多 16 张</small>
          </div>
          <div class="product-image-process-upload-actions">
            <button class="product-tool-primary" type="button" :disabled="isCuttingOut || cutoutFiles.length >= 16" @click="cutoutImageInput?.click()">
              {{ cutoutFiles.length ? `继续添加（还可选 ${16 - cutoutFiles.length} 张）` : '选择图片' }}
            </button>
            <button v-if="cutoutFiles.length" type="button" :disabled="isCuttingOut" @click="clearCutoutFiles">清空</button>
          </div>
        </div>

        <div v-if="cutoutFiles.length" class="product-image-process-selection">
          <article v-for="(item, index) in cutoutFiles" :key="item.id">
            <div class="product-image-process-thumb"><img :src="item.previewUrl" :alt="item.file.name" /><span>待抠图</span></div>
            <div><strong>{{ item.file.name }}</strong><small>{{ formatFileSize(item.file.size) }}</small></div>
            <div class="product-image-process-item-actions">
              <button type="button" :disabled="isCuttingOut" @click="removeCutoutImage(index)">删除</button>
            </div>
          </article>
        </div>

        <div v-if="cutoutFiles.length" class="product-image-process-actions">
          <button class="product-tool-primary" type="button" :disabled="isCuttingOut" @click="generateCutoutImages">
            {{ isCuttingOut ? '正在自动抠图...' : `开始自动抠图（${cutoutFiles.length} 张）` }}
          </button>
          <span>款号_1 保存到 product1，款号_2 保存到 product2，并统一重命名为款号.png</span>
        </div>

        <div v-if="cutoutTaskStatus" class="product-image-process-progress" :class="{ error: cutoutTaskStatus === 'failed' }">
          <div><strong>{{ cutoutTaskStatusText }}</strong><span>{{ cutoutProgress }}%</span></div>
          <div class="product-image-process-progress-track"><i :style="{ width: `${cutoutProgress}%` }"></i></div>
          <small v-if="cutoutTaskError">{{ cutoutTaskError }}</small>
          <code v-if="cutoutOutputDirectory" class="product-image-process-batch-path">{{ cutoutOutputDirectory }}</code>
        </div>

        <section v-if="cutoutResults.length" class="product-image-process-results">
          <div class="product-import-section-head">
            <div><strong>抠图结果</strong><small>预览和下载均使用透明 PNG</small></div>
          </div>
          <div class="product-image-process-result-grid">
            <article v-for="item in cutoutResults" :key="item.url">
              <img :src="item.cutoutObjectUrl" :alt="item.sourceFilename" />
              <div><strong>{{ item.sourceFilename }}</strong><small>{{ item.width }} × {{ item.height }} · {{ item.savedPath }}</small></div>
              <button class="product-tool-primary" type="button" @click="downloadCutoutResult(item)">下载透明 PNG</button>
            </article>
          </div>
        </section>
      </div>
    </section>

    <section class="product-tool-panel product-white-image-module product-oss-upload-module">
      <div class="product-tool-panel-head product-oss-tool-head">
        <div><h3 class="product-module-title"><span class="product-module-index">3</span>阿里云OSS图片上传工具</h3><small>图片上传后自动写入 jewelry_product_db.product_image</small></div>
        <div class="product-oss-meta" aria-label="阿里云 OSS 配置">
          <span>Bucket: dering</span><span>Domain: img.deringdiam.com</span>
        </div>
      </div>
      <div class="product-image-process-workspace">
        <div class="product-oss-upload-grid">
          <article class="product-oss-upload-card is-single">
            <div class="product-oss-card-title"><span>1</span><strong>单张图片</strong></div>
            <p>填写 OSS 目录，图片使用原文件名保存。</p>
            <label class="product-oss-card-field"><span>OSS 目录</span><input v-model.trim="ossSinglePrefix" maxlength="200" placeholder="product1" :disabled="isUploadingOss" /></label>
            <input ref="ossSingleInput" class="product-import-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" :disabled="isUploadingOss" @change="handleOssSingleSelection" />
            <div class="product-oss-card-field">
              <span>图片文件</span>
              <button class="product-oss-file-picker" type="button" :disabled="isUploadingOss" @click="ossSingleInput?.click()">
                <span><strong>选择一张图片</strong><small>{{ ossSingleFile?.file.name || '未选择文件' }}</small></span><em>浏览</em>
              </button>
            </div>
            <button class="product-tool-primary product-oss-upload-button" type="button" :disabled="isUploadingOss || !ossSingleFile || !ossSinglePrefix" @click="uploadImagesToOss('single')">{{ isUploadingOss && ossUploadingMode === 'single' ? '正在上传...' : '上传单张图片' }}</button>
          </article>

          <article class="product-oss-upload-card is-multiple">
            <div class="product-oss-card-title"><span>2</span><strong>多张图片</strong></div>
            <p>一次选择多张图片，统一上传到填写的 OSS 目录。</p>
            <label class="product-oss-card-field"><span>OSS 目录</span><input v-model.trim="ossMultiplePrefix" maxlength="200" placeholder="product1" :disabled="isUploadingOss" /></label>
            <input ref="ossMultipleInput" class="product-import-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple :disabled="isUploadingOss" @change="handleOssMultipleSelection" />
            <div class="product-oss-card-field">
              <span>图片文件</span>
              <button class="product-oss-file-picker" type="button" :disabled="isUploadingOss" @click="ossMultipleInput?.click()">
                <span><strong>选择多张图片</strong><small>{{ ossMultipleFiles.length ? `已选择 ${ossMultipleFiles.length} 张` : '未选择文件' }}</small></span><em>浏览</em>
              </button>
            </div>
            <button class="product-tool-primary product-oss-upload-button" type="button" :disabled="isUploadingOss || !ossMultipleFiles.length || !ossMultiplePrefix" @click="uploadImagesToOss('multiple')">{{ isUploadingOss && ossUploadingMode === 'multiple' ? '正在上传...' : `上传多张图片${ossMultipleFiles.length ? `（${ossMultipleFiles.length}）` : ''}` }}</button>
          </article>

          <article class="product-oss-upload-card is-folder">
            <div class="product-oss-card-title"><span>3</span><strong>整个文件夹</strong></div>
            <p>文件夹名作为 OSS 目录，并保留图片的子目录与文件名。</p>
            <input ref="ossFolderInput" class="product-import-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" webkitdirectory directory multiple :disabled="isUploadingOss" @change="handleOssFolderSelection" />
            <div class="product-oss-card-field product-oss-folder-field">
              <span>图片文件夹</span>
              <button class="product-oss-file-picker" type="button" :disabled="isUploadingOss" @click="ossFolderInput?.click()">
                <span><strong>选择本地文件夹</strong><small>{{ ossFolderName ? `${ossFolderName}（${ossFolderFiles.length} 张）` : '未选择文件夹' }}</small></span><em>浏览</em>
              </button>
            </div>
            <button class="product-tool-primary product-oss-upload-button" type="button" :disabled="isUploadingOss || !ossFolderFiles.length" @click="uploadImagesToOss('folder')">{{ isUploadingOss && ossUploadingMode === 'folder' ? '正在上传...' : '上传文件夹' }}</button>
          </article>
        </div>
        <div v-if="ossUploadSummary" class="product-image-process-progress" :class="{ error: ossUploadSummary.failed }">
          <div><strong>上传完成：成功 {{ ossUploadSummary.uploaded }} 张，失败 {{ ossUploadSummary.failed }} 张</strong><span>{{ ossUploadSummary.total }} 张</span></div>
          <div class="product-image-process-progress-track"><i style="width: 100%"></i></div>
        </div>
        <div v-if="ossUploadResults.length" class="product-import-table-wrap">
          <table class="product-import-table product-oss-result-table">
            <thead><tr><th>文件</th><th>款号</th><th>OSS 对象</th><th>数据库</th><th>状态</th></tr></thead>
            <tbody><tr v-for="(item, index) in ossUploadResults" :key="`${item.objectKey || item.filename}-${index}`">
              <td>{{ item.filename }}</td><td>{{ item.productStyleNo || '—' }}</td><td>{{ item.objectKey || '—' }}</td>
              <td>{{ item.databaseAction === 'created' ? '新增' : (item.databaseAction === 'updated' ? '更新' : '—') }}</td>
              <td :class="{ 'product-oss-result-error': item.status !== 'uploaded' }">{{ item.status === 'uploaded' ? '成功' : item.message }}</td>
            </tr></tbody>
          </table>
        </div>
      </div>
    </section>
    </template>

    <section v-else-if="activeTool === 'edit'" class="product-tool-panel">
      <div class="product-tool-panel-head">
        <div><span>修改商品</span><h3>选择需要修改的商品</h3></div>
      </div>
      <ProductSearch :token="props.token" action-label="选择修改" @select="selectProduct" />
      <form v-if="selectedProduct" class="product-maintenance-form product-maintenance-form--spaced" @submit.prevent="saveProduct('edit')">
        <label><span>商品款号</span><input :value="productForm.styleNo" readonly /></label>
        <ProductFields />
        <button class="product-tool-primary" type="submit" :disabled="isSaving">{{ isSaving ? '保存中...' : '保存修改' }}</button>
      </form>
    </section>

    <section v-else-if="activeTool === 'availability'" class="product-tool-panel">
      <div class="product-tool-panel-head">
        <div><span>商品上下架</span><h3>搜索并调整商品状态</h3></div>
      </div>
      <ProductSearch :key="`availability-${searchRevision}`" :token="props.token" action-label="调整状态" availability-mode edit-mode @select="toggleProductAvailability" @edit="openProductEditor" />
    </section>

    <section v-else-if="activeTool === 'series'" class="product-tool-panel">
      <div class="product-tool-panel-head">
        <div><span>首页系列</span><h3>更改系列</h3></div>
        <strong>{{ homepageSeries.length }} 个首页系列</strong>
      </div>
      <form class="homepage-series-editor" @submit.prevent="saveHomepageSeries">
        <label class="homepage-series-editor-field">
          <span>选择系列</span>
          <select v-model="selectedHomepageSeriesSlug" :disabled="isSavingSeries" @change="applySelectedHomepageSeries">
            <option v-for="item in homepageSeries" :key="item.slug" :value="item.slug">{{ item.title }}</option>
          </select>
        </label>

        <div v-if="selectedHomepageSeries" class="homepage-series-cover-preview">
          <img :src="selectedHomepageSeries.coverImage" :alt="selectedHomepageSeries.title" />
          <div><strong>系列封面保持不变</strong><small>{{ selectedHomepageSeries.coverImage }}</small></div>
        </div>

        <div class="homepage-series-editor-copy">
          <label class="homepage-series-editor-field">
            <span>系列名称</span>
            <input v-model.trim="homepageSeriesForm.title" maxlength="100" required />
          </label>
          <label class="homepage-series-editor-field">
            <span>系列副标题</span>
            <input v-model.trim="homepageSeriesForm.kicker" maxlength="100" />
          </label>
          <label class="homepage-series-editor-field is-wide">
            <span>系列介绍</span>
            <textarea v-model.trim="homepageSeriesForm.description" maxlength="500" rows="4" required></textarea>
          </label>
        </div>

        <div class="homepage-series-products-editor">
          <div><strong>详情页精选商品</strong><small>按填写顺序展示，最多8款；商品必须已录入并上架</small></div>
          <div class="homepage-series-style-grid">
            <label v-for="index in 8" :key="index">
              <span>{{ index }}</span>
              <input v-model.trim="homepageSeriesForm.styleNos[index - 1]" maxlength="64" :placeholder="`第 ${index} 个商品款号`" />
            </label>
          </div>
        </div>

        <button class="product-tool-primary homepage-series-save" type="submit" :disabled="isSavingSeries || !selectedHomepageSeriesSlug">
          {{ isSavingSeries ? '保存中...' : '保存系列修改' }}
        </button>
      </form>
    </section>

    <div
      v-if="seriesResultDialog.open"
      class="product-import-modal-backdrop"
      @click.self="closeSeriesResultDialog"
      @keydown.esc="closeSeriesResultDialog"
    >
      <section
        class="product-import-modal homepage-series-result-modal"
        :class="{ error: seriesResultDialog.type === 'error' }"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="homepage-series-result-title"
        aria-describedby="homepage-series-result-message"
      >
        <span class="homepage-series-result-icon" aria-hidden="true">
          {{ seriesResultDialog.type === 'success' ? '✓' : '!' }}
        </span>
        <h3 id="homepage-series-result-title">{{ seriesResultDialog.title }}</h3>
        <p id="homepage-series-result-message">{{ seriesResultDialog.message }}</p>
        <div class="product-import-modal-actions homepage-series-result-actions">
          <button class="product-tool-primary" type="button" autofocus @click="closeSeriesResultDialog">确定</button>
        </div>
      </section>
    </div>

    <div v-if="showImportConfirmModal" class="product-import-modal-backdrop" @click.self="closeImportConfirm">
      <section class="product-import-modal product-import-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="product-import-dialog-title">
        <h3 id="product-import-dialog-title">是否上传至数据库？</h3>
        <p>以下 {{ importPreview?.rowCount || 0 }} 行数据将插入 jewelry_product_db.product 表。</p>

        <template v-if="importPreview">
          <div class="product-import-modal-section">
            <strong>参数对应关系</strong>
            <div class="product-import-map-summary">
              <span v-for="fieldItem in finalPreviewFields" :key="fieldItem.key">
                <strong>{{ sourceDescription(fieldItem.key) }}</strong><i>写入</i>{{ fieldItem.label }}
              </span>
            </div>
          </div>

          <fieldset v-if="importPreview.salesPriceOnly && !importMapping.labelPrice" class="product-import-price-choice">
            <legend>销售价是否 × 4 写入最高标签价？</legend>
            <label><input v-model="importPriceMode" type="radio" value="sales_x4" /> 是，最高标签价 = 销售价 × 4</label>
            <label><input v-model="importPriceMode" type="radio" value="sales_direct" /> 否，最高标签价 = 销售价原值</label>
          </fieldset>

          <div class="product-import-modal-section">
            <strong>待入库数据</strong>
            <div class="product-import-table-wrap">
              <table class="product-import-table">
                <thead><tr><th>Excel 行</th><th v-for="fieldItem in finalPreviewFields" :key="fieldItem.key">{{ fieldItem.label }}</th></tr></thead>
                <tbody>
                  <tr v-for="row in importPreview.rows.slice(0, 8)" :key="row._rowNumber">
                    <td>{{ row._rowNumber }}</td>
                    <td v-for="fieldItem in finalPreviewFields" :key="fieldItem.key">{{ displayCell(finalImportValue(row, fieldItem.key)) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <small v-if="importPreview.rowCount > 8">仅展示前 8 行，确认后上传全部 {{ importPreview.rowCount }} 行。</small>
          </div>
        </template>

        <div class="product-import-modal-actions">
          <button type="button" class="product-tool-primary" :disabled="isImporting" @click="confirmProductImport">{{ isImporting ? '上传中...' : '是，上传至数据库' }}</button>
          <button type="button" :disabled="isImporting" @click="closeImportConfirm">否，取消</button>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, defineComponent, h, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const props = defineProps({
  token: { type: String, required: true },
})

const toolTabs = [
  { key: 'create', label: '上新商品', description: '录入新款商品资料' },
  { key: 'availability', label: '商品上下架', description: '下架或重新上架商品' },
  { key: 'series', label: '更改系列', description: '调整首页系列内容与精选商品' },
]

const importFields = [
  { key: 'styleNo', label: '商品款号', required: true },
  { key: 'name', label: '商品名称', required: true },
  { key: 'series', label: '所属系列' },
  { key: 'type', label: '品类' },
  { key: 'material', label: '材质' },
  { key: 'totalWeight', label: '总重' },
  { key: 'labelPrice', label: '最高标签价' },
  { key: 'livePrice', label: '直播价' },
  { key: 'inventory', label: '库存' },
  { key: 'unshippedQty', label: '未出货数' },
  { key: 'commission', label: '佣金 %' },
  { key: 'stoneColor', label: '石颜色' },
  { key: 'stoneShape', label: '石形状' },
  { key: 'mainStone', label: '主石' },
  { key: 'sideStone', label: '副石' },
  { key: 'sizeDesc', label: '尺寸说明' },
  { key: 'sellingPoint', label: '口播卖点' },
  { key: 'guaranteeInfo', label: '商品保障' },
  { key: 'remark', label: '备注' },
]

const emptyProduct = () => ({
  styleNo: '', name: '', series: '', type: '', material: '', totalWeight: '',
  labelPrice: '', livePrice: '', inventory: '', unshippedQty: '', commission: '',
  stoneColor: '', stoneShape: '', mainStone: '', sideStone: '', sizeDesc: '',
  sellingPoint: '', guaranteeInfo: '', remark: '',
})

const activeTool = ref('menu')
const activeToolMeta = computed(() => toolTabs.find((item) => item.key === activeTool.value) || toolTabs[0])
const productForm = reactive(emptyProduct())
const selectedProduct = ref(null)
const seriesOptions = ref([])
const homepageSeries = ref([])
const selectedHomepageSeriesSlug = ref('')
const homepageSeriesForm = reactive({ title: '', kicker: '', description: '', styleNos: Array(8).fill('') })
const isSaving = ref(false)
const isSavingSeries = ref(false)
const seriesResultDialog = reactive({ open: false, type: 'success', title: '', message: '' })
const searchRevision = ref(0)
const notice = ref('')
const noticeType = ref('success')
const createMode = ref('excel')
const excelFileInput = ref(null)
const importPreview = ref(null)
const importMapping = reactive({})
const importHistory = ref([])
const isParsingExcel = ref(false)
const isImporting = ref(false)
const isLoadingHistory = ref(false)
const showImportConfirmModal = ref(false)
const importPriceMode = ref('sales_x4')
const imageProcessMode = ref('white-background')
const whiteImageInput = ref(null)
const whiteImageFilesInput = ref(null)
const whiteBatches = ref([])
const whiteTaskStatus = ref('')
const whiteProgress = ref(0)
const whiteTaskError = ref('')
const whiteResults = ref([])
const isGeneratingWhiteImage = ref(false)
const cutoutImageInput = ref(null)
const cutoutFiles = ref([])
const cutoutTaskStatus = ref('')
const cutoutProgress = ref(0)
const cutoutTaskError = ref('')
const cutoutOutputDirectory = ref('')
const cutoutResults = ref([])
const isCuttingOut = ref(false)
const ossSingleInput = ref(null)
const ossMultipleInput = ref(null)
const ossFolderInput = ref(null)
const ossSingleFile = ref(null)
const ossMultipleFiles = ref([])
const ossFolderFiles = ref([])
const ossFolderName = ref('')
const ossSinglePrefix = ref('product1')
const ossMultiplePrefix = ref('product1')
const ossUploadResults = ref([])
const ossUploadSummary = ref(null)
const isUploadingOss = ref(false)
const ossUploadingMode = ref('')
const whiteTotalImageCount = computed(() => whiteBatches.value.reduce((total, batch) => total + batch.files.length, 0))
let whiteImageSequence = 0
let cutoutImageSequence = 0
const whiteTaskStatusText = computed(() => ({
  queued: '批量任务正在排队',
  running: `正在批量生成（${whiteBatches.value.filter((batch) => batch.status === 'succeeded').length}/${whiteBatches.value.length} 款完成）`,
  succeeded: `${whiteBatches.value.length} 个款号全部生成完成`,
  failed: '批量任务结束，部分款号生成失败',
}[whiteTaskStatus.value] || '正在准备'))
const cutoutTaskStatusText = computed(() => ({
  queued: '自动抠图任务正在排队',
  running: `正在使用 BiRefNet 处理 ${cutoutFiles.value.length} 张图片`,
  succeeded: `${cutoutResults.value.length} 张图片抠图完成`,
  failed: '自动抠图失败',
}[cutoutTaskStatus.value] || '正在准备'))
const finalPreviewFields = computed(() => importFields.filter((fieldItem) => (
  importMapping[fieldItem.key]
  || (fieldItem.key === 'labelPrice' && importPreview.value?.salesPriceOnly && !importMapping.labelPrice)
)))

function field(label, key, options = {}) {
  const input = options.type === 'textarea'
    ? h('textarea', {
        value: productForm[key],
        rows: options.rows || 3,
        maxlength: options.maxlength,
        placeholder: options.placeholder || '',
        onInput: (event) => { productForm[key] = event.target.value },
      })
    : h('input', {
        value: productForm[key],
        type: options.type || 'text',
        min: options.min,
        step: options.step,
        maxlength: options.maxlength,
        placeholder: options.placeholder || '',
        required: options.required || false,
        onInput: (event) => { productForm[key] = event.target.value },
      })
  return h('label', { class: options.wide ? 'is-wide' : '' }, [h('span', label), input])
}

const ProductFields = defineComponent({
  setup() {
    return () => [
      field('商品名称', 'name', { maxlength: 200, required: true }),
      h('label', [
        h('span', '所属系列'),
        h('select', {
          value: productForm.series,
          onChange: (event) => { productForm.series = event.target.value },
        }, [
          h('option', { value: '' }, '未分类系列'),
          ...seriesOptions.value.map((item) => h('option', { value: item }, item)),
        ]),
      ]),
      field('品类', 'type', { maxlength: 100, placeholder: '项链、戒指、耳饰等' }),
      field('材质', 'material', { maxlength: 100, placeholder: '18K白、Pt950等' }),
      field('总重', 'totalWeight', { type: 'number', min: 0, step: '0.01' }),
      field('展示价格', 'labelPrice', { type: 'number', min: 0, step: '0.01' }),
      field('直播价', 'livePrice', { type: 'number', min: 0, step: '0.01' }),
      field('库存', 'inventory', { type: 'number', min: 0, step: 1 }),
      field('未出货数', 'unshippedQty', { type: 'number', min: 0, step: 1 }),
      field('佣金 %', 'commission', { type: 'number', min: 0, step: '0.01' }),
      field('石颜色', 'stoneColor', { maxlength: 100 }),
      field('石形状', 'stoneShape', { maxlength: 100 }),
      field('主石', 'mainStone', { maxlength: 200 }),
      field('副石', 'sideStone', { maxlength: 200 }),
      field('尺寸说明', 'sizeDesc', { maxlength: 500 }),
      field('口播卖点', 'sellingPoint', { type: 'textarea', maxlength: 500, wide: true }),
      field('商品保障', 'guaranteeInfo', { type: 'textarea', maxlength: 500, wide: true }),
      field('备注', 'remark', { type: 'textarea', maxlength: 1000, wide: true }),
    ]
  },
})

const ProductSearch = defineComponent({
  props: {
    actionLabel: { type: String, required: true },
    token: { type: String, required: true },
    danger: { type: Boolean, default: false },
    availabilityMode: { type: Boolean, default: false },
    editMode: { type: Boolean, default: false },
  },
  emits: ['select', 'edit'],
  setup(componentProps, { emit }) {
    const query = ref('')
    const products = ref([])
    const loading = ref(false)
    const searched = ref(false)

    async function search() {
      loading.value = true
      try {
        const params = new URLSearchParams({ page: '1', pageSize: '100', q: query.value.trim() })
        const response = await fetch(`/api/admin/products?${params}`, {
          headers: { Authorization: `Bearer ${componentProps.token}` },
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload.detail || '商品加载失败')
        products.value = Array.isArray(payload.products) ? payload.products : []
        searched.value = true
      } catch (error) {
        showNotice(error instanceof Error ? error.message : '商品加载失败', 'error')
      } finally {
        loading.value = false
      }
    }

    return () => h('div', { class: 'product-search' }, [
      h('form', { class: 'product-search-form', onSubmit: (event) => { event.preventDefault(); search() } }, [
        h('label', [h('span', '款号或商品名称'), h('input', {
          value: query.value,
          placeholder: '输入关键词搜索',
          onInput: (event) => { query.value = event.target.value },
        })]),
        h('button', { type: 'submit', disabled: loading.value }, loading.value ? '搜索中...' : '搜索'),
      ]),
      searched.value && !products.value.length
        ? h('p', { class: 'product-tool-empty' }, '没有找到商品')
        : h('div', { class: 'product-search-results' }, products.value.map((product) => h('article', { key: product.styleNo }, [
            h('span', [
              h('strong', product.name || product.styleNo),
              h('small', `${product.styleNo} · ${product.series || '未分类系列'} · ${product.type || '未分类'}`),
              componentProps.availabilityMode
                ? h('i', { class: product.isActive === false ? 'is-offline' : 'is-online' }, product.isActive === false ? '已下架' : '已上架')
                : null,
            ]),
            h('div', { class: 'product-search-result-actions' }, [
              h('button', {
                type: 'button',
                class: componentProps.availabilityMode
                  ? (product.isActive === false ? 'is-restore' : 'is-danger')
                  : (componentProps.danger ? 'is-danger' : ''),
                onClick: () => emit('select', product),
              }, componentProps.availabilityMode
                ? (product.isActive === false ? '重新上架' : '下架')
                : componentProps.actionLabel),
              componentProps.editMode
                ? h('button', {
                  type: 'button',
                  class: 'is-edit',
                  onClick: () => emit('edit', product),
                }, '修改商品信息')
                : null,
            ]),
          ]))),
    ])
  },
})

function showNotice(message, type = 'success') {
  notice.value = message
  noticeType.value = type
}

function showSeriesResultDialog(type, message) {
  seriesResultDialog.type = type
  seriesResultDialog.title = type === 'success' ? '更改系列成功' : '更改系列失败'
  seriesResultDialog.message = message
  seriesResultDialog.open = true
}

function closeSeriesResultDialog() {
  seriesResultDialog.open = false
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${props.token}`,
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.detail || '操作失败')
  return payload
}

function openTool(key) {
  activeTool.value = key
  notice.value = ''
  selectedProduct.value = null
  if (key === 'create') Object.assign(productForm, emptyProduct())
}

function selectCreateMode(mode) {
  createMode.value = mode
  if (mode === 'history') loadImportHistory()
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function clearWhiteResults() {
  whiteResults.value.forEach((item) => URL.revokeObjectURL(item.previewUrl))
  whiteResults.value = []
}

function handleWhiteImageSelection(event) {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  if (!files.length) return
  const supportedFiles = files.filter((file) => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
  if (!supportedFiles.length) {
    showNotice('所选目录中没有 PNG、JPG 或 WebP 图片', 'error')
    return
  }
  const grouped = new Map()
  supportedFiles.forEach((file) => {
    const parts = (file.webkitRelativePath || '').split(/[\\/]/).filter(Boolean)
    const styleNo = parts.length >= 3 ? parts[1] : (parts.length === 2 ? parts[0] : inferStyleNo(file.name))
    if (!grouped.has(styleNo)) grouped.set(styleNo, [])
    grouped.get(styleNo).push(file)
  })
  const existingStyles = new Set(whiteBatches.value.map((batch) => batch.styleNo))
  const newStyleCount = [...grouped.keys()].filter((styleNo) => !existingStyles.has(styleNo)).length
  if (whiteBatches.value.length + newStyleCount > 8) {
    showNotice(`最多一次生成 8 个款号，当前已有 ${whiteBatches.value.length} 个`, 'error')
    return
  }
  const oversized = supportedFiles.find((file) => file.size > 50 * 1024 * 1024)
  if (oversized) {
    showNotice(`${oversized.name} 超过 50MB`, 'error')
    return
  }

  const additionsByStyle = new Map()
  for (const [styleNo, batchFiles] of grouped.entries()) {
    const existingBatch = whiteBatches.value.find((item) => item.styleNo === styleNo)
    const signatures = new Set((existingBatch?.files || []).map((item) => imageFileSignature(item.file)))
    const additions = batchFiles.filter((file) => {
      const signature = imageFileSignature(file)
      if (signatures.has(signature)) return false
      signatures.add(signature)
      return true
    })
    if ((existingBatch?.files.length || 0) + additions.length > 16) {
      showNotice(`款号 ${styleNo} 最多保留 16 张图片`, 'error')
      return
    }
    additionsByStyle.set(styleNo, additions)
  }

  let addedImageCount = 0
  for (const [styleNo, additions] of additionsByStyle.entries()) {
    let batch = whiteBatches.value.find((item) => item.styleNo === styleNo)
    if (!batch) {
      batch = { styleNo, files: [], taskId: '', statusUrl: '', styleFolder: '', status: '', progress: 0, error: '', outputDirectory: '' }
      whiteBatches.value.push(batch)
    }
    batch.files.push(...additions.map((file) => ({
      id: ++whiteImageSequence,
      file,
      previewUrl: URL.createObjectURL(file),
    })))
    addedImageCount += additions.length
  }
  resetWhiteImageTask()
  showNotice(addedImageCount
    ? `已添加 ${addedImageCount} 张图片，当前共 ${whiteBatches.value.length} 个款号`
    : '所选图片均已存在')
}

function inferStyleNo(filename) {
  return filename.replace(/\.[^.]+$/, '').replace(/[_-](?:正面|侧面|背面|细节|front|side|back)$/i, '').replace(/_\d+$/, '')
}

function imageFileSignature(file) {
  return `${file.name}:${file.size}:${file.lastModified}`
}

function clearCutoutResults() {
  cutoutResults.value.forEach((item) => {
    URL.revokeObjectURL(item.cutoutObjectUrl)
  })
  cutoutResults.value = []
}

function resetCutoutTask() {
  clearCutoutResults()
  cutoutTaskStatus.value = ''
  cutoutProgress.value = 0
  cutoutTaskError.value = ''
  cutoutOutputDirectory.value = ''
}

function handleCutoutImageSelection(event) {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  if (!files.length) return
  const supportedFiles = files.filter((file) => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
  if (!supportedFiles.length) {
    showNotice('请选择 PNG、JPG 或 WebP 图片', 'error')
    return
  }
  const oversized = supportedFiles.find((file) => file.size > 50 * 1024 * 1024)
  if (oversized) {
    showNotice(`${oversized.name} 超过 50MB`, 'error')
    return
  }
  const signatures = new Set(cutoutFiles.value.map((item) => imageFileSignature(item.file)))
  const additions = supportedFiles.filter((file) => {
    const signature = imageFileSignature(file)
    if (signatures.has(signature)) return false
    signatures.add(signature)
    return true
  })
  if (cutoutFiles.value.length + additions.length > 16) {
    showNotice(`自动抠图一次最多上传 16 张，当前已有 ${cutoutFiles.value.length} 张`, 'error')
    return
  }
  cutoutFiles.value.push(...additions.map((file) => ({
    id: ++cutoutImageSequence,
    file,
    previewUrl: URL.createObjectURL(file),
  })))
  resetCutoutTask()
  showNotice(additions.length ? `已添加 ${additions.length} 张待抠图图片` : '所选图片均已存在')
}

function removeCutoutImage(index) {
  const [removed] = cutoutFiles.value.splice(index, 1)
  if (removed) URL.revokeObjectURL(removed.previewUrl)
  resetCutoutTask()
}

function clearCutoutFiles() {
  cutoutFiles.value.forEach((item) => URL.revokeObjectURL(item.previewUrl))
  cutoutFiles.value = []
  resetCutoutTask()
  showNotice('已清空待抠图图片')
}

async function generateCutoutImages() {
  if (!cutoutFiles.value.length || isCuttingOut.value) return
  resetCutoutTask()
  cutoutTaskStatus.value = 'queued'
  isCuttingOut.value = true
  try {
    const body = new FormData()
    cutoutFiles.value.forEach((item) => body.append('images', item.file))
    const payload = await api('/api/admin/image-processing/cutout/tasks', { method: 'POST', body })
    if (!payload.taskId) throw new Error('自动抠图任务没有返回任务编号')
    await applyCutoutTaskPayload(payload)
    await pollCutoutTask(payload.taskId, payload.statusUrl)
    showNotice(`${cutoutResults.value.length} 张图片已完成自动抠图并保存`)
  } catch (error) {
    cutoutTaskStatus.value = 'failed'
    cutoutProgress.value = 100
    cutoutTaskError.value = error instanceof Error ? error.message : '自动抠图失败'
    showNotice(cutoutTaskError.value, 'error')
  } finally {
    isCuttingOut.value = false
  }
}

async function applyCutoutTaskPayload(payload) {
  cutoutTaskStatus.value = payload.status || 'running'
  cutoutProgress.value = Number.isFinite(Number(payload.progress)) ? Number(payload.progress) : 0
  cutoutTaskError.value = payload.error || ''
  cutoutOutputDirectory.value = payload.outputDirectory || cutoutOutputDirectory.value
  const images = Array.isArray(payload.images) ? payload.images : []
  const currentFiles = cutoutResults.value.map((item) => item.url).join('|')
  const nextFiles = images.map((item) => item.url).join('|')
  if (currentFiles !== nextFiles) await loadCutoutResults(images)
}

async function pollCutoutTask(taskId, statusUrl = '') {
  const deadline = Date.now() + 30 * 60 * 1000
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const payload = await api(statusUrl || `/api/admin/image-processing/cutout/tasks/${taskId}`)
    await applyCutoutTaskPayload(payload)
    if (payload.status === 'succeeded') return
    if (payload.status === 'failed') throw new Error(payload.error || '自动抠图失败')
  }
  throw new Error('自动抠图等待超时，请稍后重新处理')
}

async function loadCutoutResults(images) {
  clearCutoutResults()
  cutoutResults.value = await Promise.all(images.map(async (item) => {
    const cutoutBlob = await fetchProtectedImage(item.url)
    return {
      ...item,
      cutoutObjectUrl: URL.createObjectURL(cutoutBlob),
    }
  }))
}

function downloadCutoutResult(item) {
  const link = document.createElement('a')
  link.href = item.cutoutObjectUrl
  link.download = item.filename
  link.click()
}

function resetOssUploadResult() {
  ossUploadResults.value = []
  ossUploadSummary.value = null
}

function isSupportedOssImage(file) {
  return ['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)
    || /\.(png|jpe?g|webp|gif)$/i.test(file.name)
}

function ossFileItem(file, relativePath = '') {
  return { file, relativePath }
}

function handleOssSingleSelection(event) {
  const file = Array.from(event.target.files || [])[0]
  event.target.value = ''
  if (!file || !isSupportedOssImage(file)) {
    ossSingleFile.value = null
    showNotice('请选择 jpg、jpeg、png、gif 或 webp 图片', 'error')
    return
  }
  ossSingleFile.value = ossFileItem(file)
  resetOssUploadResult()
}

function handleOssMultipleSelection(event) {
  const files = Array.from(event.target.files || []).filter(isSupportedOssImage)
  event.target.value = ''
  const signatures = new Set()
  const uniqueFiles = files.filter((file) => {
    const signature = imageFileSignature(file)
    if (signatures.has(signature)) return false
    signatures.add(signature)
    return true
  })
  if (uniqueFiles.length > 100) {
    showNotice('多张图片一次最多选择 100 张', 'error')
    return
  }
  ossMultipleFiles.value = uniqueFiles.map((file) => ossFileItem(file))
  resetOssUploadResult()
  showNotice(uniqueFiles.length ? `已选择 ${uniqueFiles.length} 张待上传图片` : '所选文件中没有支持的图片', uniqueFiles.length ? 'success' : 'error')
}

function handleOssFolderSelection(event) {
  const files = Array.from(event.target.files || []).filter(isSupportedOssImage)
  event.target.value = ''
  if (files.length > 100) {
    showNotice('文件夹一次最多上传 100 张图片', 'error')
    return
  }
  ossFolderFiles.value = files.map((file) => ossFileItem(file, file.webkitRelativePath || file.name))
  ossFolderName.value = files[0]?.webkitRelativePath?.split('/')[0] || ''
  resetOssUploadResult()
  showNotice(files.length ? `已选择文件夹 ${ossFolderName.value}，共 ${files.length} 张图片` : '所选文件夹中没有支持的图片', files.length ? 'success' : 'error')
}

async function uploadImagesToOss(mode) {
  const files = mode === 'single'
    ? (ossSingleFile.value ? [ossSingleFile.value] : [])
    : (mode === 'multiple' ? ossMultipleFiles.value : ossFolderFiles.value)
  const prefix = mode === 'single' ? ossSinglePrefix.value : (mode === 'multiple' ? ossMultiplePrefix.value : '')
  if (!files.length || (mode !== 'folder' && !prefix) || isUploadingOss.value) return
  isUploadingOss.value = true
  ossUploadingMode.value = mode
  resetOssUploadResult()
  try {
    const body = new FormData()
    body.append('oss_prefix', prefix)
    files.forEach((item) => {
      body.append('images', item.file)
      if (mode === 'folder') body.append('object_paths', item.relativePath)
    })
    const payload = await api('/api/admin/image-processing/aliyun-oss/upload', { method: 'POST', body })
    ossUploadResults.value = Array.isArray(payload.results) ? payload.results : []
    ossUploadSummary.value = {
      total: Number(payload.total || 0),
      uploaded: Number(payload.uploaded || 0),
      failed: Number(payload.failed || 0),
    }
    showNotice(
      payload.failed ? `阿里云上传完成：成功 ${payload.uploaded} 张，失败 ${payload.failed} 张` : `${payload.uploaded} 张图片已上传阿里云并写入数据库`,
      payload.failed ? 'error' : 'success',
    )
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '阿里云上传失败', 'error')
  } finally {
    isUploadingOss.value = false
    ossUploadingMode.value = ''
  }
}

function resetWhiteImageTask() {
  clearWhiteResults()
  whiteTaskStatus.value = ''
  whiteProgress.value = 0
  whiteTaskError.value = ''
  whiteBatches.value.forEach((batch) => Object.assign(batch, {
    taskId: '', statusUrl: '', styleFolder: '', status: '', progress: 0, error: '', outputDirectory: '',
  }))
}

function removeWhiteImage(batchIndex, index) {
  const batch = whiteBatches.value[batchIndex]
  if (!batch) return
  const [removed] = batch.files.splice(index, 1)
  if (removed) URL.revokeObjectURL(removed.previewUrl)
  if (!batch.files.length) whiteBatches.value.splice(batchIndex, 1)
  resetWhiteImageTask()
  showNotice(whiteBatches.value.length ? `已删除，当前共 ${whiteBatches.value.length} 个款号` : '已清空商品图片')
}

function clearWhiteImageFiles() {
  whiteBatches.value.forEach((batch) => batch.files.forEach((item) => URL.revokeObjectURL(item.previewUrl)))
  whiteBatches.value = []
  resetWhiteImageTask()
  showNotice('已清空商品图片')
}

function removeWhiteBatch(batchIndex) {
  const [removed] = whiteBatches.value.splice(batchIndex, 1)
  removed?.files.forEach((item) => URL.revokeObjectURL(item.previewUrl))
  resetWhiteImageTask()
  showNotice(`已删除款号 ${removed?.styleNo || ''}`)
}

function setWhiteMainImage(batchIndex, index) {
  const items = [...whiteBatches.value[batchIndex].files]
  const [selected] = items.splice(index, 1)
  items.unshift(selected)
  whiteBatches.value[batchIndex].files = items
}

async function generateWhiteBackgroundImage() {
  if (!whiteBatches.value.length || isGeneratingWhiteImage.value) return
  clearWhiteResults()
  whiteTaskStatus.value = 'queued'
  whiteProgress.value = 0
  whiteTaskError.value = ''
  isGeneratingWhiteImage.value = true
  whiteBatches.value.forEach((batch) => Object.assign(batch, { status: 'queued', progress: 0, error: '' }))
  try {
    const outcomes = await Promise.all(whiteBatches.value.map(async (batch) => {
      try {
      const body = new FormData()
      body.append('product_image', batch.files[0].file)
      body.append('style_no', batch.styleNo)
      batch.files.slice(1).forEach((item) => body.append('reference_images', item.file))
      const payload = await api('/api/admin/image-processing/white-background/tasks', { method: 'POST', body })
      if (!payload.taskId) throw new Error(`${batch.styleNo} 没有返回任务编号`)
      await applyWhiteTaskPayload(payload, batch.styleNo)
      await pollWhiteBackgroundTask(payload.taskId, batch.styleNo, payload.statusUrl)
      return true
      } catch (error) {
        batch.status = 'failed'
        batch.progress = 100
        batch.error = error instanceof Error ? error.message : '生成失败'
        updateWhiteBatchSummary()
        return false
      }
    }))
    isGeneratingWhiteImage.value = false
    const succeeded = outcomes.filter(Boolean).length
    const failed = outcomes.length - succeeded
    showNotice(
      failed ? `批量生成完成：成功 ${succeeded} 款，失败 ${failed} 款` : `${succeeded} 个款号的白底图已生成并分别保存`,
      failed ? 'error' : 'success',
    )
  } catch (error) {
    finishWhiteTaskWithError(error instanceof Error ? error.message : '白底图任务提交失败')
  }
}

async function applyWhiteTaskPayload(payload, styleNo = '') {
  const batch = whiteBatches.value.find((item) => item.styleNo === styleNo)
  if (batch) Object.assign(batch, {
    taskId: payload.taskId || batch.taskId,
    statusUrl: payload.statusUrl || batch.statusUrl,
    styleFolder: payload.styleFolder || batch.styleFolder,
    status: payload.status || 'running',
    progress: Number.isFinite(Number(payload.progress)) ? Number(payload.progress) : 0,
    error: payload.error || '',
    outputDirectory: payload.outputDirectory || batch.outputDirectory,
  })
  const images = Array.isArray(payload.images) ? payload.images : []
  const currentFiles = whiteResults.value.filter((item) => item.styleNo === styleNo).map((item) => item.filename).join('|')
  const nextFiles = images.map((item) => item.filename).join('|')
  if (currentFiles !== nextFiles) await loadWhiteResults(images, styleNo)
  updateWhiteBatchSummary()
}

function updateWhiteBatchSummary() {
  if (!whiteBatches.value.length) return
  whiteProgress.value = Math.round(whiteBatches.value.reduce((total, batch) => total + (batch.progress || 0), 0) / whiteBatches.value.length)
  const failed = whiteBatches.value.filter((batch) => batch.status === 'failed')
  const succeeded = whiteBatches.value.filter((batch) => batch.status === 'succeeded')
  const completedCount = failed.length + succeeded.length
  whiteTaskStatus.value = completedCount === whiteBatches.value.length
    ? (failed.length ? 'failed' : 'succeeded')
    : (whiteBatches.value.some((batch) => batch.status === 'running') || completedCount ? 'running' : 'queued')
  whiteTaskError.value = failed.map((batch) => `${batch.styleNo}：${batch.error}`).join('；')
}

function whiteBatchStatusLabel(batch) {
  return { queued: '排队中', running: '生成中', succeeded: '已完成', failed: '失败' }[batch.status] || ''
}

async function pollWhiteBackgroundTask(taskId, styleNo = '', statusUrl = '') {
  const deadline = Date.now() + 15 * 60 * 1000
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const route = statusUrl || `/api/admin/image-processing/white-background/tasks/${taskId}`
    const payload = await api(route)
    await applyWhiteTaskPayload(payload, styleNo)
    if (payload.status === 'succeeded') return
    if (payload.status === 'failed') throw new Error(payload.error || '白底图生成失败')
  }
  throw new Error('白底图生成等待超时，请稍后重新进入页面查看保存目录')
}

function finishWhiteTaskWithError(message) {
  isGeneratingWhiteImage.value = false
  whiteTaskStatus.value = 'failed'
  whiteProgress.value = 100
  whiteTaskError.value = message
  showNotice(message, 'error')
}

async function fetchProtectedImage(url) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${props.token}` } })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.detail || `白底图加载失败（HTTP ${response.status}）`)
  }
  return response.blob()
}

async function loadWhiteResults(images, styleNo = '') {
  const results = await Promise.all(images.map(async (item) => {
    const blob = await fetchProtectedImage(item.url)
    return { ...item, styleNo, previewUrl: URL.createObjectURL(blob) }
  }))
  whiteResults.value = [...whiteResults.value.filter((item) => item.styleNo !== styleNo), ...results]
}

function downloadWhiteResult(item) {
  const link = document.createElement('a')
  link.href = item.previewUrl
  link.download = item.filename
  link.click()
}

function clearImportMapping() {
  Object.keys(importMapping).forEach((key) => delete importMapping[key])
}

async function handleExcelFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  isParsingExcel.value = true
  try {
    const body = new FormData()
    body.append('file', file)
    const payload = await api('/api/admin/products/import/preview', { method: 'POST', body })
    importPreview.value = payload
    clearImportMapping()
    Object.assign(importMapping, payload.suggestedMapping || {})
    if (!importMapping.styleNo || !importMapping.name) {
      const missing = [!importMapping.styleNo ? '商品款号' : '', !importMapping.name ? '商品名称' : ''].filter(Boolean).join('和')
      throw new Error(`未识别到${missing}，请检查 Excel 表头名称`)
    }
    importPriceMode.value = 'sales_x4'
    showImportConfirmModal.value = true
    showNotice(`已读取 ${payload.fileName}，共 ${payload.rowCount} 行`)
  } catch (error) {
    importPreview.value = null
    clearImportMapping()
    showImportConfirmModal.value = false
    showNotice(error instanceof Error ? error.message : 'Excel 读取失败', 'error')
  } finally {
    isParsingExcel.value = false
  }
}

function beginImport() {
  if (!importMapping.styleNo || !importMapping.name) {
    showNotice('未识别到商品款号或商品名称，请检查 Excel 表头名称', 'error')
    return
  }
  showImportConfirmModal.value = true
}

function closeImportConfirm() {
  if (!isImporting.value) showImportConfirmModal.value = false
}

function confirmProductImport() {
  const mode = importPreview.value?.salesPriceOnly && !importMapping.labelPrice
    ? importPriceMode.value
    : 'mapped'
  submitProductImport(mode)
}

async function submitProductImport(labelPriceMode) {
  if (!importPreview.value || isImporting.value) return
  isImporting.value = true
  try {
    const payload = await api('/api/admin/products/import', {
      method: 'POST',
      body: JSON.stringify({
        fileName: importPreview.value.fileName,
        sheetName: importPreview.value.sheetName,
        columns: importPreview.value.columns,
        rows: importPreview.value.rows,
        mapping: { ...importMapping },
        salesPriceColumn: importPreview.value.salesPriceColumn,
        labelPriceMode,
      }),
    })
    showImportConfirmModal.value = false
    showNotice(`导入成功：已向 ${payload.databaseName || 'jewelry_product_db'}.product 表插入 ${payload.count} 条商品`)
    importPreview.value = null
    clearImportMapping()
    if (excelFileInput.value) excelFileInput.value.value = ''
    await loadImportHistory()
  } catch (error) {
    showImportConfirmModal.value = false
    showNotice(error instanceof Error ? error.message : '商品导入失败', 'error')
  } finally {
    isImporting.value = false
  }
}

function sourceColumn(fieldKey) {
  if (!importPreview.value) return null
  const columnKey = fieldKey === 'labelPrice' && !importMapping.labelPrice && importPreview.value.salesPriceOnly
    ? importPreview.value.salesPriceColumn
    : importMapping[fieldKey]
  return importPreview.value.columns.find((column) => column.key === columnKey) || null
}

function sourceDescription(fieldKey) {
  const column = sourceColumn(fieldKey)
  if (!column) return '未识别'
  const suffix = fieldKey === 'labelPrice' && !importMapping.labelPrice && importPreview.value?.salesPriceOnly
    ? (importPriceMode.value === 'sales_x4' ? ' × 4' : ' 原值')
    : ''
  return `${column.letter} · ${column.label}${suffix}`
}

function finalImportValue(row, fieldKey) {
  const column = sourceColumn(fieldKey)
  const value = column ? row[column.key] : null
  if (fieldKey !== 'labelPrice' || importMapping.labelPrice || !importPreview.value?.salesPriceOnly) return value
  if (value === null || value === undefined || value === '') return value
  const number = Number(String(value).replace(/[￥¥$,，\s]/g, ''))
  if (!Number.isFinite(number)) return value
  return importPriceMode.value === 'sales_x4' ? number * 4 : number
}

async function loadImportHistory() {
  if (isLoadingHistory.value) return
  isLoadingHistory.value = true
  try {
    const payload = await api('/api/admin/products/import/history?page=1&pageSize=50')
    importHistory.value = Array.isArray(payload.items) ? payload.items : []
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '导入历史加载失败', 'error')
  } finally {
    isLoadingHistory.value = false
  }
}

function displayCell(value) {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

function formatPrice(value) {
  if (value === null || value === undefined || value === '') return '—'
  const number = Number(value)
  return Number.isFinite(number) ? `¥${number.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : String(value)
}

function formatImportTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN', { hour12: false })
}

function selectProduct(product) {
  selectedProduct.value = product
  Object.assign(productForm, emptyProduct(), product, {
    styleNo: product.styleNo || product.code || '',
    name: product.name || '',
    type: product.type || '',
    series: product.series === '未分类系列' ? '' : (product.series || ''),
    guaranteeInfo: Array.isArray(product.guaranteeLines) ? product.guaranteeLines.join('\n') : (product.guaranteeInfo || ''),
  })
  notice.value = ''
}

function openProductEditor(product) {
  activeTool.value = 'edit'
  selectedProduct.value = null
  selectProduct(product)
}

function productPayload() {
  return Object.fromEntries(Object.entries(productForm).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]))
}

async function saveProduct(mode) {
  isSaving.value = true
  try {
    const isCreate = mode === 'create'
    const path = isCreate ? '/api/admin/products' : `/api/admin/products/${encodeURIComponent(productForm.styleNo)}`
    const payload = await api(path, { method: isCreate ? 'POST' : 'PATCH', body: JSON.stringify(productPayload()) })
    showNotice(isCreate ? `已上新商品 ${payload.product?.styleNo || productForm.styleNo}` : `已保存商品 ${productForm.styleNo}`)
    if (isCreate) Object.assign(productForm, emptyProduct())
    else selectProduct(payload.product || selectedProduct.value)
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '商品保存失败', 'error')
  } finally {
    isSaving.value = false
  }
}

async function toggleProductAvailability(product) {
  const styleNo = product.styleNo || product.code
  const isActive = product.isActive === false
  const actionText = isActive ? '重新上架' : '下架'
  if (!window.confirm(`确认${actionText}商品 ${product.name || styleNo}（${styleNo}）？`)) return
  try {
    await api(`/api/admin/products/${encodeURIComponent(styleNo)}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    })
    searchRevision.value += 1
    showNotice(`商品 ${styleNo} 已${actionText}`)
  } catch (error) {
    showNotice(error instanceof Error ? error.message : `商品${actionText}失败`, 'error')
  }
}

async function loadSeries() {
  try {
    const payload = await api('/api/admin/product-series')
    seriesOptions.value = Array.isArray(payload.items) ? payload.items : []
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '系列加载失败', 'error')
  }
}

function applySelectedHomepageSeries() {
  const item = homepageSeries.value.find((series) => series.slug === selectedHomepageSeriesSlug.value)
  homepageSeriesForm.title = item?.title || ''
  homepageSeriesForm.kicker = item?.kicker || ''
  homepageSeriesForm.description = item?.description || ''
  homepageSeriesForm.styleNos = Array.from({ length: 8 }, (_, index) => item?.styleNos?.[index] || '')
}

const selectedHomepageSeries = computed(() => (
  homepageSeries.value.find((item) => item.slug === selectedHomepageSeriesSlug.value) || null
))

async function loadHomepageSeries() {
  try {
    const payload = await api('/api/admin/homepage-series')
    homepageSeries.value = Array.isArray(payload.items) ? payload.items : []
    if (!homepageSeries.value.some((item) => item.slug === selectedHomepageSeriesSlug.value)) {
      selectedHomepageSeriesSlug.value = homepageSeries.value[0]?.slug || ''
    }
    applySelectedHomepageSeries()
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '首页系列加载失败', 'error')
  }
}

async function saveHomepageSeries() {
  if (!selectedHomepageSeriesSlug.value) return
  isSavingSeries.value = true
  try {
    const payload = await api(`/api/admin/homepage-series/${encodeURIComponent(selectedHomepageSeriesSlug.value)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: homepageSeriesForm.title,
        kicker: homepageSeriesForm.kicker,
        description: homepageSeriesForm.description,
        styleNos: homepageSeriesForm.styleNos.filter(Boolean),
      }),
    })
    const index = homepageSeries.value.findIndex((item) => item.slug === selectedHomepageSeriesSlug.value)
    if (index >= 0 && payload.item) homepageSeries.value[index] = payload.item
    applySelectedHomepageSeries()
    const seriesTitle = payload.item?.title || homepageSeriesForm.title
    const successMessage = `系列“${seriesTitle}”已保存并生效。`
    showNotice(`已更新系列 ${seriesTitle}`)
    showSeriesResultDialog('success', successMessage)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '系列修改失败，请稍后重试。'
    showNotice(errorMessage, 'error')
    showSeriesResultDialog('error', errorMessage)
  } finally {
    isSavingSeries.value = false
  }
}

onMounted(() => {
  loadSeries()
  loadHomepageSeries()
})

onBeforeUnmount(() => {
  whiteBatches.value.forEach((batch) => batch.files.forEach((item) => URL.revokeObjectURL(item.previewUrl)))
  cutoutFiles.value.forEach((item) => URL.revokeObjectURL(item.previewUrl))
  clearWhiteResults()
  clearCutoutResults()
})
</script>
