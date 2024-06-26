/**
 * @copyright Copyright (c) 2019 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { getDavNameSpaces, getDavProperties } from '@nextcloud/files'
import { getClient } from './WebdavClient'
import { genFileInfo, type FileInfo } from '../utils/fileUtils'
import type { FileStat, ResponseDataDetailed } from 'webdav'

/**
 * Retrieve the files list
 * @param path
 * @param options
 */
export default async function(path: string, options = {}): Promise<FileInfo[]> {
	// getDirectoryContents doesn't accept / for root
	const fixedPath = path === '/' ? '' : path

	const response = await getClient().getDirectoryContents(fixedPath, Object.assign({
		data: `<?xml version="1.0"?>
			<d:propfind ${getDavNameSpaces()}>
				<d:prop>
					<oc:tags />
					${getDavProperties()}
				</d:prop>
			</d:propfind>`,
		details: true,
	}, options)) as ResponseDataDetailed<FileStat[]>

	return response.data.map(genFileInfo)
}
