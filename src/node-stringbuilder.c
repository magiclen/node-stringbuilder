#include <node_api.h>
#include <stdlib.h>
#include <memory.h>
#include <math.h>

#define max(a,b) (((a)>(b)) ? (a) : (b))
#define blockSize 256

napi_ref TrueRef, FalseRef, StringBuilderRef, ReadStreamRef, ReadFileStreamRef, RegExpSearchRef;

// TODO -----Creators-----

napi_value createFalse(napi_env env){
        napi_value result;
        napi_get_reference_value(env, FalseRef, &result);
        return result;
}

napi_value createTrue(napi_env env){
        napi_value result;
        napi_get_reference_value(env, TrueRef, &result);
        return result;
}

napi_value createEmptyArray(napi_env env){
        napi_value result;
        napi_create_array_with_length(env, 0, &result);
        return result;
}

// TODO -----Functions-----

napi_value boyerMooreMagicLen(napi_env env, char16_t* source, int64_t sourceLength, char16_t* pattern, int64_t patternLength, int64_t offset, int64_t limit){
        if (patternLength == 0 || offset < 0 || sourceLength - offset < patternLength) {
                return createEmptyArray(env);
        }
        if(limit <= 0) {
                limit = 1000;
        }

        uint32_t* buffer;
        napi_value arrayBuffer;
        napi_create_arraybuffer(env, limit * 4, (void**)(&buffer), &arrayBuffer);

        int64_t sourceLength_dec = sourceLength - 1;
        int64_t patternLength_dec = patternLength - 1;
        napi_value resultList;
        uint32_t resultListLength = 0;
        int64_t badCharShiftMap[65536] = { patternLength };
        int64_t i;
        for (i = 0; i < patternLength_dec; ++i) {
                char16_t index = pattern[i];
                badCharShiftMap[index] = patternLength_dec - i;
        }
        char16_t specialChar = pattern[patternLength_dec];
        int64_t specialShift = badCharShiftMap[specialChar];
        badCharShiftMap[specialChar] = 0;
        int64_t sourcePointer = offset + patternLength_dec;
        int64_t patternPointer;
        while (sourcePointer < sourceLength) {
                patternPointer = patternLength_dec;
                while (patternPointer >= 0) {
                        if (source[sourcePointer] != pattern[patternPointer]) {
                                break;
                        }
                        --sourcePointer;
                        --patternPointer;
                }
                int64_t starePointer = sourcePointer;
                int64_t goodSuffixLength_inc = patternLength - patternPointer;
                sourcePointer += goodSuffixLength_inc;
                if (patternPointer < 0) {
                        buffer[resultListLength++] = starePointer + 1;
                        if (sourcePointer > sourceLength_dec || resultListLength == limit) {
                                break;
                        } else {
                                sourcePointer += badCharShiftMap[source[sourcePointer]];
                                continue;
                        }
                }
                int64_t shift1 = (sourcePointer <= sourceLength_dec) ? badCharShiftMap[source[sourcePointer]] : 0;
                if (shift1 >= patternLength_dec) {
                        sourcePointer += shift1;
                } else {
                        int64_t shift2 = ((source[starePointer] == specialChar) ? specialShift : badCharShiftMap[source[starePointer]]) - goodSuffixLength_inc;
                        sourcePointer += (shift1 >= shift2) ? shift1 : shift2;
                }
        }
        napi_create_typedarray(env, napi_uint32_array, resultListLength, arrayBuffer, 0, &resultList);
        return resultList;
}

napi_value boyerMooreMagicLenSkip(napi_env env, char16_t* source, int64_t sourceLength, char16_t* pattern, int64_t patternLength, int64_t offset, int64_t limit){
        if (patternLength == 0 || offset < 0 || sourceLength - offset < patternLength) {
                return createEmptyArray(env);
        }
        if(limit <= 0) {
                limit = 1000;
        }

        uint32_t* buffer;
        napi_value arrayBuffer;
        napi_create_arraybuffer(env, limit * 4, (void**)(&buffer), &arrayBuffer);

        int64_t sourceLength_dec = sourceLength - 1;
        int64_t patternLength_dec = patternLength - 1;
        napi_value resultList;
        uint32_t resultListLength = 0;
        int64_t badCharShiftMap[65536] = { patternLength };
        int64_t i;
        for (i = 0; i < patternLength_dec; ++i) {
                char16_t index = pattern[i];
                badCharShiftMap[index] = patternLength_dec - i;
        }
        char16_t specialChar = pattern[patternLength_dec];
        int64_t specialShift = badCharShiftMap[specialChar];
        badCharShiftMap[specialChar] = 0;
        int64_t sourcePointer = offset + patternLength_dec;
        int64_t patternPointer;
        while (sourcePointer < sourceLength) {
                patternPointer = patternLength_dec;
                while (patternPointer >= 0) {
                        if (source[sourcePointer] != pattern[patternPointer]) {
                                break;
                        }
                        --sourcePointer;
                        --patternPointer;
                }
                int64_t starePointer = sourcePointer;
                int64_t goodSuffixLength_inc = patternLength - patternPointer;
                sourcePointer += goodSuffixLength_inc;
                if (patternPointer < 0) {
                        buffer[resultListLength++] = starePointer + 1;
                        if (sourcePointer > sourceLength_dec || resultListLength == limit) {
                                break;
                        } else {
                                sourcePointer += patternLength_dec;
                                continue;
                        }
                }
                int64_t shift1 = (sourcePointer <= sourceLength_dec) ? badCharShiftMap[source[sourcePointer]] : 0;
                if (shift1 >= patternLength_dec) {
                        sourcePointer += shift1;
                } else {
                        int64_t shift2 = ((source[starePointer] == specialChar) ? specialShift : badCharShiftMap[source[starePointer]]) - goodSuffixLength_inc;
                        sourcePointer += (shift1 >= shift2) ? shift1 : shift2;
                }
        }
        napi_create_typedarray(env, napi_uint32_array, resultListLength, arrayBuffer, 0, &resultList);
        return resultList;
}

void boyerMooreMagicLenSkipPure(char16_t* source, int64_t sourceLength, char16_t* pattern, int64_t patternLength, int64_t offset, int64_t limit, int64_t** resultList, int64_t* resultListLength){
        if (patternLength == 0 || offset < 0 || sourceLength - offset < patternLength) {
                *resultListLength = -1;
                return;
        }
        if(limit <= 0) {
                limit = sourceLength / patternLength;
        }

        *resultList = (int64_t*)malloc(sizeof(int64_t) * limit);
        *resultListLength = 0;

        int64_t sourceLength_dec = sourceLength - 1;
        int64_t patternLength_dec = patternLength - 1;
        int64_t badCharShiftMap[65536] = { patternLength };
        int64_t i;
        for (i = 0; i < patternLength_dec; ++i) {
                char16_t index = pattern[i];
                badCharShiftMap[index] = patternLength_dec - i;
        }
        char16_t specialChar = pattern[patternLength_dec];
        int64_t specialShift = badCharShiftMap[specialChar];
        badCharShiftMap[specialChar] = 0;
        int64_t sourcePointer = offset + patternLength_dec;
        int64_t patternPointer;
        while (sourcePointer < sourceLength) {
                patternPointer = patternLength_dec;
                while (patternPointer >= 0) {
                        if (source[sourcePointer] != pattern[patternPointer]) {
                                break;
                        }
                        --sourcePointer;
                        --patternPointer;
                }
                int64_t starePointer = sourcePointer;
                int64_t goodSuffixLength_inc = patternLength - patternPointer;
                sourcePointer += goodSuffixLength_inc;
                if (patternPointer < 0) {
                        (*resultList)[(*resultListLength)++] = starePointer + 1;
                        if (sourcePointer > sourceLength_dec || *resultListLength == limit) {
                                break;
                        } else {
                                sourcePointer += patternLength_dec;
                                continue;
                        }
                }
                int64_t shift1 = (sourcePointer <= sourceLength_dec) ? badCharShiftMap[source[sourcePointer]] : 0;
                if (shift1 >= patternLength_dec) {
                        sourcePointer += shift1;
                } else {
                        int64_t shift2 = ((source[starePointer] == specialChar) ? specialShift : badCharShiftMap[source[starePointer]]) - goodSuffixLength_inc;
                        sourcePointer += (shift1 >= shift2) ? shift1 : shift2;
                }
        }
}

napi_value boyerMooreMagicLenRev(napi_env env, char16_t* source, int64_t sourceLength, char16_t* pattern, int64_t patternLength, int64_t offset, int64_t limit){
        if (patternLength == 0 || offset < 0 || sourceLength - offset < patternLength) {
                return createEmptyArray(env);
        }
        if(limit <= 0) {
                limit = 1000;
        }

        uint32_t* buffer;
        napi_value arrayBuffer;
        napi_create_arraybuffer(env, limit * 4, (void**)(&buffer), &arrayBuffer);

        int64_t sourceLength_dec = sourceLength - 1;
        int64_t patternLength_dec = patternLength - 1;
        napi_value resultList;
        napi_create_array(env, &resultList);
        int64_t resultListLength = 0;
        int64_t badCharShiftMap[65536] = { patternLength };
        int64_t i;
        for (i = patternLength_dec; i > 0; --i) {
                char16_t index = pattern[i];
                badCharShiftMap[index] = i;
        }
        char16_t specialChar = pattern[patternLength_dec];
        int64_t specialShift = badCharShiftMap[specialChar];
        badCharShiftMap[specialChar] = 0;
        int64_t sourcePointer = sourceLength_dec - patternLength_dec - offset;
        int64_t patternPointer;
        while (sourcePointer >= 0) {
                patternPointer = 0;
                while (patternPointer < patternLength) {
                        if (source[sourcePointer] != pattern[patternPointer]) {
                                break;
                        }
                        ++sourcePointer;
                        ++patternPointer;
                }
                int64_t starePointer = sourcePointer;
                int64_t goodSuffixLength_inc = patternPointer + 1;
                sourcePointer -= goodSuffixLength_inc;
                if (patternPointer >= patternLength) {
                        buffer[resultListLength++] = sourcePointer + 1;
                        if (sourcePointer < 0 || resultListLength == limit) {
                                break;
                        } else {
                                sourcePointer -= badCharShiftMap[source[sourcePointer]];
                                continue;
                        }
                }
                int64_t shift1 = (sourcePointer >= 0) ? badCharShiftMap[source[sourcePointer]] : 0;
                if (shift1 >= patternLength_dec) {
                        sourcePointer -= shift1;
                } else {
                        int64_t shift2 = ((source[starePointer] == specialChar) ? specialShift : badCharShiftMap[source[starePointer]]) - goodSuffixLength_inc;
                        sourcePointer -= (shift1 >= shift2) ? shift1 : shift2;
                }
        }
        napi_create_typedarray(env, napi_uint32_array, resultListLength, arrayBuffer, 0, &resultList);
        return resultList;
}

void getRawData(napi_env env, napi_value me, uint8_t** raw, uint64_t* rawLength){
        napi_value _raw;
        napi_get_element(env, me, 0, &_raw);
        napi_get_buffer_info(env, _raw, (void**)raw, rawLength);
}

void getBufferAndMetaData(napi_env env, napi_value me, uint16_t** buffer, int64_t** metadata){
        napi_value _raw;
        uint8_t* raw;
        uint64_t rawLength;
        napi_get_element(env, me, 0, &_raw);
        napi_get_buffer_info(env, _raw, (void**)(&raw), &rawLength);
        *buffer = (uint16_t*)(raw + 16);
        *metadata = (int64_t*)raw;
}

void getMetaData(napi_env env, napi_value me, int64_t** metadata){
        napi_value _raw;
        uint8_t* raw;
        napi_get_element(env, me, 0, &_raw);
        napi_get_buffer_info(env, _raw, (void**)(&raw), 0);
        *metadata = (int64_t*)raw;
}

void reAlloc(napi_env env, napi_value me, uint16_t** buffer, int64_t** metadata, int64_t newSize) {
        int64_t capacity = (*metadata)[0];
        if (capacity < newSize) {
                int64_t length = (*metadata)[1];
                int64_t count = (newSize - capacity + blockSize - 1) / blockSize;
                int64_t sizeToAdd = count * blockSize;
                uint16_t* oldBuffer = *buffer;
                napi_value _raw;
                uint8_t* raw;
                int64_t newCapacity = capacity + sizeToAdd;
                napi_create_buffer(env, 16 + newCapacity, (void**)(&raw), &_raw);
                *buffer = (uint16_t*)(raw + 16);
                memcpy(*buffer, oldBuffer, length);
                *metadata = (int64_t*)raw;
                (*metadata)[0] = newCapacity;
                (*metadata)[1] = length;
                napi_set_element(env, me, 0, _raw);
                // TODO Need to free old data?
        }
}

napi_value appendUTF16FromOutside(napi_env env, napi_value me, napi_value source, uint16_t** buffer, int64_t** metadata) {
        int64_t contentBufferLength;
        int64_t length = (*metadata)[1];
        int64_t concatLength;
        napi_valuetype type;
        napi_typeof(env, source, &type);
        if (type == napi_string) {
                napi_get_value_string_utf16(env, source, NULL, 0, (uint64_t*)(&contentBufferLength));
                contentBufferLength *= 2;
                concatLength = length + contentBufferLength;
                reAlloc(env, me, buffer, metadata, concatLength + 2);
                napi_get_value_string_utf16(env, source, *buffer + (length / 2), contentBufferLength + 2, 0);
                (*metadata)[1] = concatLength;
                return me;
        }else if(type == napi_object) {
                bool isStringBuilder;
                napi_value StringBuilder;
                napi_get_reference_value(env, StringBuilderRef, &StringBuilder);
                napi_instanceof(env, source, StringBuilder, &isStringBuilder);
                if(isStringBuilder) {
                        uint16_t* t_buffer;
                        int64_t* t_metadata;
                        getBufferAndMetaData(env, source, &t_buffer, &t_metadata);
                        concatLength = length + t_metadata[1];
                        reAlloc(env, me, buffer, metadata, concatLength);
                        memcpy(*buffer + (length / 2), t_buffer, t_metadata[1]);
                        (*metadata)[1] = concatLength;
                        return me;
                }
                bool isBuffer;
                napi_is_buffer(env, source, &isBuffer);
                if(isBuffer) {
                        char* utf8Data;
                        size_t utf8DataLength;
                        napi_get_buffer_info(env, source, (void**)(&utf8Data), &utf8DataLength);
                        napi_value tempString;
                        napi_create_string_utf8(env, utf8Data, utf8DataLength, &tempString);
                        napi_get_value_string_utf16(env, tempString, NULL, 0, (uint64_t*)&contentBufferLength);
                        contentBufferLength *= 2;
                        concatLength = length + contentBufferLength;
                        reAlloc(env, me, buffer, metadata, concatLength + 2);
                        napi_get_value_string_utf16(env, tempString, *buffer + (length / 2), contentBufferLength + 2, 0);
                        (*metadata)[1] = concatLength;
                        return me;
                }
                bool isReadStream;
                napi_value ReadStream;
                napi_get_reference_value(env, ReadStreamRef, &ReadStream);
                napi_instanceof(env, source, ReadStream, &isReadStream);
                if(isReadStream) {
                        napi_value ReadFileStream;
                        napi_get_reference_value(env, ReadFileStreamRef, &ReadFileStream);
                        napi_value result;
                        uint64_t* contentBuffer;
                        napi_value args[1];
                        args[0] = source;
                        napi_call_function(env, source, ReadFileStream, 1, args, &result);
                        napi_get_buffer_info(env, result, (void**)(&contentBuffer), (uint64_t*)&contentBufferLength);
                        concatLength = length + contentBufferLength;
                        reAlloc(env, me, buffer, metadata, concatLength);
                        memcpy(*buffer + (length / 2), contentBuffer, contentBufferLength);
                        (*metadata)[1] = concatLength;
                        return me;
                }
                type = napi_boolean;
        }
        if(type == napi_boolean || type == napi_number) {
                napi_value tempString;
                napi_coerce_to_string(env, source, &tempString);
                napi_get_value_string_utf16(env, tempString, NULL, 0, (uint64_t*)&contentBufferLength);
                contentBufferLength *= 2;
                concatLength = length + contentBufferLength;
                reAlloc(env, me, buffer, metadata, concatLength + 2);
                napi_get_value_string_utf16(env, tempString, *buffer + (length / 2), contentBufferLength + 2, 0);
                (*metadata)[1] = concatLength;
        }
        return me;
}

void getUTF16FromOutside(napi_env env, napi_value source, uint16_t** sourceData, int64_t* sourceDataLength, bool* freeAble) {
        napi_valuetype type;
        napi_typeof(env, source, &type);
        if (type == napi_string) {
                size_t sourceDataSize;
                napi_get_value_string_utf16(env, source, NULL, 0, &sourceDataSize);
                ++sourceDataSize;
                *sourceData = (uint16_t*)malloc(sourceDataSize * 2);
                *freeAble = true;
                napi_get_value_string_utf16(env, source, *sourceData, sourceDataSize, &sourceDataSize);
                *sourceDataLength = sourceDataSize * 2;
        }else if(type == napi_object) {
                bool isStringBuilder;
                napi_value StringBuilder;
                napi_get_reference_value(env, StringBuilderRef, &StringBuilder);
                napi_instanceof(env, source, StringBuilder, &isStringBuilder);
                if(isStringBuilder) {
                        int64_t* metadata;
                        getBufferAndMetaData(env, source, sourceData, &metadata);
                        *sourceDataLength = metadata[1];
                        *freeAble = false;
                        return;
                }
                bool isBuffer;
                napi_is_buffer(env, source, &isBuffer);
                if(isBuffer) {
                        char* utf8Data;
                        size_t utf8DataLength;
                        napi_get_buffer_info(env, source, (void**)(&utf8Data), &utf8DataLength);
                        napi_value tempString;
                        napi_create_string_utf8(env, utf8Data, utf8DataLength, &tempString);
                        size_t sourceDataSize;
                        napi_get_value_string_utf16(env, tempString, NULL, 0, &sourceDataSize);
                        ++sourceDataSize;
                        *sourceData = (uint16_t*)malloc(sourceDataSize * 2);
                        *freeAble = true;
                        napi_get_value_string_utf16(env, tempString, *sourceData, sourceDataSize, &sourceDataSize);
                        *sourceDataLength = sourceDataSize * 2;
                        return;
                }
                bool isReadStream;
                napi_value ReadStream;
                napi_get_reference_value(env, ReadStreamRef, &ReadStream);
                napi_instanceof(env, source, ReadStream, &isReadStream);
                if(isReadStream) {
                        napi_value ReadFileStream;
                        napi_get_reference_value(env, ReadFileStreamRef, &ReadFileStream);
                        napi_value args[1];
                        args[0] = source;
                        napi_value result;
                        napi_call_function(env, source, ReadFileStream, 1, args, &result);
                        napi_get_buffer_info(env, result, (void**)sourceData, (uint64_t*)sourceDataLength);
                        *freeAble = false;
                        return;
                }
                type = napi_boolean;
        }else if(type == napi_boolean || type == napi_number) {
                napi_value tempString;
                napi_coerce_to_string(env, source, &tempString);
                size_t sourceDataSize;
                napi_get_value_string_utf16(env, tempString, NULL, 0, &sourceDataSize);
                ++sourceDataSize;
                *sourceData = (uint16_t*)malloc(sourceDataSize * 2);
                *freeAble = true;
                napi_get_value_string_utf16(env, tempString, *sourceData, sourceDataSize, &sourceDataSize);
                *sourceDataLength = sourceDataSize * 2;
        }else{
                *sourceDataLength = 0;
                *freeAble = false;
        }
}

void getRealIndex (napi_env env, int64_t* metadata, napi_value source, int64_t* realIndex) {
        int64_t length = metadata[1];
        int64_t index;
        napi_get_value_int64(env, source, &index);
        int64_t halfLength = length / 2;
        if (index < 0) {
                index += halfLength;
        }
        if (index < 0) {
                index = 0;
        } else if (index > halfLength) {
                index = length;
        } else {
                index *= 2;
        }
        *realIndex = index;
};

bool isTrimmable(uint16_t characterCode) {
        return characterCode <= 32 || characterCode == 12288;
}

int64_t log2Floor(int64_t n) {
        return (int64_t)floor(log2(n));
}


// TODO -----Getters-----

napi_value Length(napi_env env, napi_callback_info info){
        napi_value me;

        napi_get_cb_info(env, info, 0, 0, &me, 0);

        int64_t* metadata;

        getMetaData(env, me, &metadata);

        napi_value result;
        napi_create_number(env, metadata[1] / 2, &result);
        return result;
};

napi_value Capacity(napi_env env, napi_callback_info info){
        napi_value me;

        napi_get_cb_info(env, info, 0, 0, &me, 0);

        int64_t* metadata;

        getMetaData(env, me, &metadata);

        napi_value result;
        napi_create_number(env, metadata[0] / 2, &result);
        return result;
};

// TODO -----Changers-----

napi_value Replace(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 3;
        napi_value args[3];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        if(argsLength == 0) {
                return me;
        }

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t start, end, length = metadata[1];
        napi_value content;
        switch(argsLength) {
        case 1:
                start = 0;
                end = length;
                content = args[0];
                break;
        case 2:
                getRealIndex(env, metadata, args[0], &start);
                end = length;
                content = args[1];
                break;
        default:
                getRealIndex(env, metadata, args[0], &start);
                getRealIndex(env, metadata, args[1], &end);
                content = args[2];
        }
        uint16_t* contentBuffer;
        int64_t contentBufferLength;
        bool freeAble;
        getUTF16FromOutside(env, content, &contentBuffer, &contentBufferLength, &freeAble);
        int64_t replaceLength = end - start;
        int64_t concatLength = length + contentBufferLength - replaceLength;
        reAlloc(env, me, &buffer, &metadata, concatLength);
        if (end == length || contentBufferLength == replaceLength) {
                memcpy(buffer + (start / 2), contentBuffer, contentBufferLength);
        }else{
                memmove(buffer + ((start + contentBufferLength) / 2), buffer + (end / 2), length - end);
                memcpy(buffer + (start / 2), contentBuffer, contentBufferLength);
        }
        metadata[1] = concatLength;
        if(freeAble) {
                free(contentBuffer);
        }
        return me;
}

napi_value Insert(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 3;
        napi_value args[3];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        if(argsLength == 0) {
                return me;
        }

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t offset, length = metadata[1];
        napi_value content;
        switch(argsLength) {
        case 1:
                offset = 0;
                content = args[0];
                break;
        default:
                getRealIndex(env, metadata, args[0], &offset);
                content = args[1];
        }
        uint16_t* contentBuffer;
        int64_t contentBufferLength;
        bool freeAble;
        getUTF16FromOutside(env, content, &contentBuffer, &contentBufferLength, &freeAble);
        int64_t concatLength = length + contentBufferLength;
        reAlloc(env, me, &buffer, &metadata, concatLength);
        if (offset == length) {
                memcpy(buffer + (offset / 2), contentBuffer, contentBufferLength);
        }else{
                memmove(buffer + ((offset + contentBufferLength) / 2), buffer + (offset / 2), length - offset);
                memcpy(buffer + (offset / 2), contentBuffer, contentBufferLength);
        }
        metadata[1] = concatLength;
        if(freeAble) {
                free(contentBuffer);
        }
        return me;
}

napi_value Clear(napi_env env, napi_callback_info info){
        napi_value me;
        napi_get_cb_info(env, info, 0, 0, &me, 0);

        int64_t* metadata;

        getMetaData(env, me, &metadata);
        metadata[1] = 0;
        return me;
}

napi_value Delete(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 2;
        napi_value args[2];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        if(argsLength == 0) {
                return me;
        }

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t start, end, length = metadata[1];
        switch(argsLength) {
        case 1:
                getRealIndex(env, metadata, args[0], &start);
                end = length;
                break;
        default:
                getRealIndex(env, metadata, args[0], &start);
                getRealIndex(env, metadata, args[1], &end);
        }
        if (start >= end) {
                return me;
        }
        if (end == length) {
                metadata[1] = start;
        } else {
                memmove(buffer + (start / 2), buffer + (end / 2), length - end);
                metadata[1] = length - (end - start);
        }
        return me;
}

napi_value DeleteCharAt(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 1;
        napi_value args[1];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        if(argsLength == 0) {
                return me;
        }

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t index, length = metadata[1];
        getRealIndex(env, metadata, args[0], &index);
        if (index == length) {
                return me;
        }
        metadata[1] -= 2;
        if (index != length - 1) {
                memmove(buffer + (index / 2), buffer + ((index + 2) / 2), length - index - 1);
        }
        return me;
}

napi_value Substring(napi_env env, napi_callback_info info){
        size_t argsLength = 2;
        napi_value args[2];

        napi_value me;
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t start, end;
        switch(argsLength) {
        case 0:
                start = 0;
                end = metadata[1];
                break;
        case 1: {
                getRealIndex(env, metadata, args[0], &start);
                end = metadata[1];
                break;
        }
        default: {
                getRealIndex(env, metadata, args[0], &start);
                getRealIndex(env, metadata, args[1], &end);
                break;
        }
        }
        if (start >= end) {
                metadata[1] = 0;
                return me;
        }
        if (start == 0) {
                metadata[1] = end;
        } else {
                metadata[1] = end - start;
                memmove(buffer, buffer + (start / 2), metadata[1]);
        }
        return me;
}

napi_value Substr(napi_env env, napi_callback_info info){
        size_t argsLength = 2;
        napi_value args[2];

        napi_value me;
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t start, length;
        switch(argsLength) {
        case 0:
                start = 0;
                length = metadata[1];
                break;
        case 1: {
                getRealIndex(env, metadata, args[0], &start);
                length = metadata[1] - start;
                break;
        }
        default: {
                getRealIndex(env, metadata, args[0], &start);
                getRealIndex(env, metadata, args[1], &length);
                break;
        }
        }
        if (length <= 0) {
                metadata[1] = 0;
                return me;
        }else if(start + length > metadata[1]) {
                length = metadata[1] - start;
        }
        metadata[1] = length;
        if (start > 0) {
                memmove(buffer, buffer + (start / 2), length);
        }
        return me;
}

napi_value Append(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 1;
        napi_value args[1];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        if(argsLength == 0) {
                return me;
        }

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        return appendUTF16FromOutside(env, me, args[0], &buffer, &metadata);
}

napi_value AppendRepeat(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 2;
        napi_value args[2];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        if(argsLength == 0) {
                return me;
        }

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t repeatCount;
        switch(argsLength) {
        case 1:
                repeatCount = 1;
                break;
        default:
                napi_get_value_int64(env, args[1], &repeatCount);
                if (repeatCount < 1) {
                        repeatCount = 1;
                }
                break;
        }

        uint16_t* contentBuffer;
        int64_t contentBufferLength;
        bool freeAble;
        getUTF16FromOutside(env, args[0], &contentBuffer, &contentBufferLength, &freeAble);

        int64_t length = metadata[1];
        int64_t concatLength = length + (contentBufferLength * repeatCount);
        reAlloc(env, me, &buffer, &metadata, concatLength);

        // log2 copy
        int64_t log2Count = log2Floor(repeatCount);
        memcpy(buffer + (length / 2), contentBuffer, contentBufferLength);
        int64_t i;
        for (i = 1; i <= log2Count; ++i) {
                int64_t addedLength = pow(2, i - 1) * contentBufferLength;
                memcpy(buffer + ((length + addedLength) / 2), buffer + (length / 2), addedLength);
        }
        int64_t realAddedCount = pow(2, log2Count);
        length += contentBufferLength * realAddedCount;
        // normal copy
        int64_t remainCount = repeatCount - realAddedCount;
        for (i = 0; i < remainCount; ++i) {
                memcpy(buffer + (length / 2), contentBuffer, contentBufferLength);
                length += contentBufferLength;
        }
        metadata[1] = length;
        if(freeAble) {
                free(contentBuffer);
        }
        return me;
}

napi_value AppendLine(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 1;
        napi_value args[1];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        uint16_t* buffer;
        int64_t* metadata;
        getBufferAndMetaData(env, me, &buffer, &metadata);

        if(argsLength > 0) {
                appendUTF16FromOutside(env, me, args[0], &buffer, &metadata);
        }
        if(metadata[0] == metadata[1]) {
                reAlloc(env, me, &buffer, &metadata, metadata[0] + 2);
        }
        buffer[metadata[1] / 2] = 10;
        metadata[1] += 2;
        return me;
}

napi_value Reverse(napi_env env, napi_callback_info info){
        napi_value me;
        napi_get_cb_info(env, info, 0, 0, &me, 0);

        uint16_t* buffer;
        int64_t* metadata;
        getBufferAndMetaData(env, me, &buffer, &metadata);

        reAlloc(env, me, &buffer, &metadata, metadata[1] * 2);
        int64_t length_div_2 = metadata[1] / 2;
        int64_t i, capacity_dec_2_div_2 = (metadata[0] - 2) / 2;
        for (i = 0; i < length_div_2; ++i) {
                memmove(buffer + capacity_dec_2_div_2 - i, buffer + i, 2);
        }
        memmove(buffer, buffer + ((metadata[0] - metadata[1]) / 2), metadata[1]);
        return me;
}

napi_value UpperCase(napi_env env, napi_callback_info info){
        napi_value me;
        napi_get_cb_info(env, info, 0, 0, &me, 0);

        uint16_t* buffer;
        int64_t* metadata;
        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t i, length = metadata[1] / 2;
        for (i = 0; i < length; i++) {
                uint16_t v = buffer[i];
                if (v >= 97 && v <= 122) {
                        buffer[i] -= 32;
                }
        }
        return me;
}

napi_value LowerCase(napi_env env, napi_callback_info info){
        napi_value me;
        napi_get_cb_info(env, info, 0, 0, &me, 0);

        uint16_t* buffer;
        int64_t* metadata;
        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t i, length = metadata[1] / 2;
        for (i = 0; i < length; i++) {
                uint16_t v = buffer[i];
                if (v >= 65 && v <= 90) {
                        buffer[i] += 32;
                }
        }
        return me;
}

napi_value ReplacePattern(napi_env env, napi_callback_info info){
        size_t argsLength = 4;
        napi_value args[4];

        napi_value me;
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        if(argsLength < 2) {
                return me;
        }

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        uint16_t* pattern;
        int64_t patternLength;
        bool patternFreeAble;
        int64_t offset, limit;
        switch(argsLength) {
        case 2: {
                offset = 0;
                limit = 1;
                break;
        }
        case 3: {
                getRealIndex(env, metadata, args[2], &offset);
                limit = 1;
                break;
        }
        default: {
                getRealIndex(env, metadata, args[2], &offset);
                getRealIndex(env, metadata, args[3], &limit);
                break;
        }
        }

        getUTF16FromOutside(env, args[0], &pattern, &patternLength, &patternFreeAble);

        int64_t* resultList;
        int64_t resultListLength;
        boyerMooreMagicLenSkipPure(buffer, metadata[1] / 2, pattern, patternLength / 2, offset, limit, &resultList, &resultListLength);
        if (resultListLength <= 0) {
                if(resultListLength == 0) {
                        free(resultList);
                }
                if(patternFreeAble) {
                        free(pattern);
                }
                return me;
        }

        uint16_t* content;
        int64_t contentLength;
        bool contentFreeAble;
        getUTF16FromOutside(env, args[1], &content, &contentLength, &contentFreeAble);

        int64_t i, diffLength = contentLength - patternLength;
        int64_t length = metadata[1];
        int64_t concatLength = length + (diffLength * resultListLength);
        reAlloc(env, me, &buffer, &metadata, concatLength);
        if (contentLength == patternLength) {
                for (i = resultListLength - 1; i >= 0; --i) {
                        memcpy(buffer + resultList[i], content, contentLength);
                }
        } else {
                if(resultListLength == 1) {
                        reAlloc(env, me, &buffer, &metadata, concatLength);
                        int64_t start = resultList[0] * 2;
                        int64_t end = start + patternLength;
                        memmove(buffer + ((start + contentLength) / 2), buffer + (end / 2), length - end);
                        memcpy(buffer + (start / 2), content, contentLength);
                }else{
                        int64_t biggerLength = max(contentLength, length);
                        reAlloc(env, me, &buffer, &metadata, biggerLength * 2);
                        int64_t originalIndex = 0, index, concatIndex = biggerLength / 2, l, pl = patternLength / 2, cl = contentLength / 2;
                        for (i = 0; i < resultListLength; ++i) {
                                index = resultList[i];
                                l = index - originalIndex;
                                memmove(buffer + concatIndex, buffer + originalIndex, l * 2);
                                concatIndex += l;
                                memcpy(buffer + concatIndex, content, contentLength);
                                concatIndex += cl;
                                originalIndex = index + pl;
                        }
                        memmove(buffer + concatIndex, buffer + originalIndex, length - (originalIndex * 2));
                        memmove(buffer, buffer + (biggerLength / 2), concatLength);
                }
        }
        metadata[1] = concatLength;
        free(resultList);
        if(patternFreeAble) {
                free(pattern);
        }
        return me;
}

napi_value ReplaceAll(napi_env env, napi_callback_info info){
        size_t argsLength = 2;
        napi_value args[2];

        napi_value me;
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);
        if(argsLength < 2) {
                return me;
        }

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        uint16_t* pattern;
        int64_t patternLength;
        bool patternFreeAble;

        getUTF16FromOutside(env, args[0], &pattern, &patternLength, &patternFreeAble);

        int64_t* resultList;
        int64_t resultListLength;
        boyerMooreMagicLenSkipPure(buffer, metadata[1] / 2, pattern, patternLength / 2, 0, 0, &resultList, &resultListLength);
        if (resultListLength <= 0) {
                if(resultListLength == 0) {
                        free(resultList);
                }
                if(patternFreeAble) {
                        free(pattern);
                }
                return me;
        }

        uint16_t* content;
        int64_t contentLength;
        bool contentFreeAble;
        getUTF16FromOutside(env, args[1], &content, &contentLength, &contentFreeAble);

        int64_t i, diffLength = contentLength - patternLength;
        int64_t length = metadata[1];
        int64_t concatLength = length + (diffLength * resultListLength);
        if (contentLength == patternLength) {
                reAlloc(env, me, &buffer, &metadata, concatLength);
                for (i = resultListLength - 1; i >= 0; --i) {
                        memcpy(buffer + resultList[i], content, contentLength);
                }
        } else {
                if(resultListLength == 1) {
                        reAlloc(env, me, &buffer, &metadata, concatLength);
                        int64_t start = resultList[0] * 2;
                        int64_t end = start + patternLength;
                        memmove(buffer + ((start + contentLength) / 2), buffer + (end / 2), length - end);
                        memcpy(buffer + (start / 2), content, contentLength);
                }else{
                        int64_t biggerLength = max(contentLength, length);
                        reAlloc(env, me, &buffer, &metadata, biggerLength * 2);
                        int64_t originalIndex = 0, index, concatIndex = biggerLength / 2, l, pl = patternLength / 2, cl = contentLength / 2;
                        for (i = 0; i < resultListLength; ++i) {
                                index = resultList[i];
                                l = index - originalIndex;
                                memmove(buffer + concatIndex, buffer + originalIndex, l * 2);
                                concatIndex += l;
                                memcpy(buffer + concatIndex, content, contentLength);
                                concatIndex += cl;
                                originalIndex = index + pl;
                        }
                        memmove(buffer + concatIndex, buffer + originalIndex, length - (originalIndex * 2));
                        memmove(buffer, buffer + (biggerLength / 2), concatLength);
                }
        }
        metadata[1] = concatLength;
        free(resultList);
        if(patternFreeAble) {
                free(pattern);
        }
        return me;
}

napi_value Trim(napi_env env, napi_callback_info info){
        napi_value me;
        napi_get_cb_info(env, info, 0, 0, &me, 0);

        uint16_t* buffer;
        int64_t* metadata;
        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t length = metadata[1] / 2;
        int64_t start = 0, end = length - 1;
        for (; start < length; ++start) {
                uint16_t v = buffer[start];
                if (isTrimmable(v)) {
                        continue;
                }
                break;
        }
        for (; end > start; --end) {
                uint16_t v = buffer[end];
                if (isTrimmable(v)) {
                        continue;
                }
                break;
        }
        start *= 2;
        end = end * 2 + 2;
        if (start >= end) {
                metadata[1] = 0;
                return me;
        }
        if (start == 0) {
                metadata[1] = end;
        } else {
                metadata[1] = end - start;
                memmove(buffer, buffer + (start / 2), metadata[1]);
        }
        return me;
}

napi_value Repeat(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 1;
        napi_value args[1];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        uint16_t* buffer;
        int64_t* metadata;
        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t repeatCount;
        if(argsLength < 1) {
                repeatCount = 1;
        }else{
                napi_get_value_int64(env, args[0], &repeatCount);
                if(repeatCount < 1) {
                        return me;
                }
        }

        int64_t length = metadata[1];
        int64_t finalLength = length * (repeatCount + 1);
        int64_t originalLength = length;
        reAlloc(env, me, &buffer, &metadata, finalLength);
        // log2 copy
        int64_t log2Count = log2Floor(repeatCount);
        memcpy(buffer + (originalLength / 2), buffer, originalLength);
        int64_t i;
        for (i = 1; i <= log2Count; ++i) {
                int64_t addedLength = pow(2, i - 1) * originalLength;
                memcpy(buffer + ((originalLength + addedLength) / 2), buffer + (originalLength / 2), addedLength);
        }
        int64_t realAddedCount = pow(2, log2Count);
        length += originalLength * realAddedCount;
        // normal copy
        int64_t remainCount = repeatCount - realAddedCount;
        for (i = 0; i < remainCount; ++i) {
                memcpy(buffer + (length / 2), buffer, originalLength);
                length += originalLength;
        }
        metadata[1] = finalLength;
        return me;
}

napi_value ExpandCapacity(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 2;
        napi_value args[2];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        uint16_t* buffer;
        int64_t* metadata;
        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t newCapacity;
        bool returnUpdatedCapacity;
        switch(argsLength) {
        case 0:
                newCapacity = metadata[0];
                returnUpdatedCapacity = false;
                break;
        case 1:
                napi_get_value_int64(env, args[0], &newCapacity);
                returnUpdatedCapacity = false;
                break;
        default:
                napi_get_value_int64(env, args[0], &newCapacity);
                napi_get_value_bool(env, args[1], &returnUpdatedCapacity);
                break;
        }
        reAlloc(env, me, &buffer, &metadata, newCapacity * 2);
        if (returnUpdatedCapacity) {
                napi_value result;
                napi_create_number(env, metadata[0] / 2, &result);
                return result;
        }
        return me;
}

napi_value ShrinkCapacity(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 1;
        napi_value args[1];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        uint16_t* buffer;
        int64_t* metadata;
        getBufferAndMetaData(env, me, &buffer, &metadata);

        bool returnUpdatedCapacity;
        if(argsLength == 0) {
                returnUpdatedCapacity = false;
        }else{
                napi_get_value_bool(env, args[0], &returnUpdatedCapacity);
        }

        int64_t count = (metadata[1] + blockSize - 1) / blockSize;
        if (count == 0) {
                count = 1;
        }
        int64_t newCapacity = count * blockSize;
        if (newCapacity < metadata[0]) {
                napi_value _new_raw;
                uint8_t* newRaw;
                napi_create_buffer_copy(env, 16 + newCapacity, (void*)metadata, (void**)(&newRaw), &_new_raw);
                metadata = (int64_t*)newRaw;
                metadata[0] = newCapacity;
                napi_set_element(env, me, 0, _new_raw);
        }

        if (returnUpdatedCapacity) {
                napi_value result;
                napi_create_number(env, metadata[0] / 2, &result);
                return result;
        }
        return me;
}

// TODO -----Unchangers-----

napi_value ToBuffer(napi_env env, napi_callback_info info){
        size_t argsLength = 2;
        napi_value args[2];

        napi_value me;
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t start, end;
        switch(argsLength) {
        case 0:
                start = 0;
                end = metadata[1];
                break;
        case 1: {
                getRealIndex(env, metadata, args[0], &start);
                end = metadata[1];
                break;
        }
        case 2: {
                getRealIndex(env, metadata, args[0], &start);
                getRealIndex(env, metadata, args[1], &end);
                break;
        }
        }
        napi_value tempString;
        napi_create_string_utf16(env, buffer + (start / 2), (end - start) / 2, &tempString);
        size_t sourceDataSize;
        napi_get_value_string_utf8(env, tempString, NULL, 0, &sourceDataSize);
        ++sourceDataSize;
        char utf8Data[sourceDataSize];
        napi_get_value_string_utf8(env, tempString, utf8Data, sourceDataSize, &sourceDataSize);
        napi_value result;
        char* data;
        napi_create_buffer_copy(env, sourceDataSize, utf8Data, (void**)(&data), &result);
        return result;
}

napi_value ToString(napi_env env, napi_callback_info info){
        size_t argsLength = 2;
        napi_value args[2];

        napi_value me;
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t start, end;
        switch(argsLength) {
        case 0:
                start = 0;
                end = metadata[1];
                break;
        case 1: {
                getRealIndex(env, metadata, args[0], &start);
                end = metadata[1];
                break;
        }
        case 2: {
                getRealIndex(env, metadata, args[0], &start);
                getRealIndex(env, metadata, args[1], &end);
                break;
        }
        }
        napi_value result;
        napi_create_string_utf16(env, buffer + (start / 2), (end - start) / 2, &result);
        return result;
}

napi_value Inspect(napi_env env, napi_callback_info info){
        napi_value me;
        napi_get_cb_info(env, info, 0, 0, &me, 0);

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        napi_value result;
        napi_create_string_utf16(env, buffer, metadata[1] / 2, &result);
        return result;
}

napi_value Clone(napi_env env, napi_callback_info info){
        napi_value me;
        napi_get_cb_info(env, info, 0, 0, &me, 0);

        uint8_t* raw;
        uint64_t rawLength;

        getRawData(env, me, &raw, &rawLength);
        napi_value _new_raw;
        uint8_t* newRaw;

        napi_create_buffer_copy(env, rawLength, raw, (void**)(&newRaw), &_new_raw);

        napi_value newMe;

        napi_value StringBuilder;
        napi_get_reference_value(env, StringBuilderRef, &StringBuilder);

        napi_value vFalse = createFalse(env);
        napi_value args[3];
        args[0] = vFalse;
        args[1] = vFalse;
        args[2] = vFalse;
        napi_new_instance(env, StringBuilder, 3, args, &newMe);
        napi_set_element(env, newMe, 0, _new_raw);
        return newMe;
}

napi_value Count(napi_env env, napi_callback_info info){
        napi_value me;
        napi_get_cb_info(env, info, 0, 0, &me, 0);

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        uint8_t mode = 0; //0: nornal, 1: appending, 2: integer, 3: prefloat, 4: float
        int64_t sum = 0, i, length = metadata[1] / 2;
        for (i = 0; i < length; ++i) {
                int64_t v = buffer[i];
                if (v >= 48 && v <= 57) {
                        switch (mode) {
                        case 0:
                                mode = 2;
                                break;
                        case 3:
                                mode = 4;
                                break;
                        default:
                                break;
                        }
                } else if ((v >= 65 && v <= 90) || (v >= 97 && v <= 122)) {
                        switch (mode) {
                        case 0:
                                mode = 1;
                                break;
                        case 2:
                                mode = 1;
                                break;
                        case 3:
                        case 4:
                                ++sum;
                                mode = 1;
                                break;
                        default:
                                break;
                        }
                } else if (v > 127) {
                        switch (mode) {
                        case 0:
                                ++sum;
                                break;
                        default:
                                sum += 2;
                                mode = 0;
                                break;
                        }
                } else {
                        switch (mode) {
                        case 0:
                                break;
                        case 2:
                                if (v == 46) {
                                        mode = 3;
                                } else {
                                        ++sum;
                                        mode = 0;
                                }
                                break;
                        default:
                                ++sum;
                                mode = 0;
                                break;
                        }
                }
        }
        if (mode != 0) {
                ++sum;
        }
        napi_value result;
        napi_create_number(env, sum, &result);
        return result;
}

napi_value EqualsIgnoreCase(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 1;
        napi_value args[1];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        if(argsLength == 0) {
                return createFalse(env);
        }

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        uint16_t* dataBuffer;
        int64_t dataLength;
        bool freeAble;
        getUTF16FromOutside(env, args[0], &dataBuffer, &dataLength, &freeAble);
        if (dataLength != metadata[1]) {
                if(freeAble) {
                        free(dataBuffer);
                }
                return createFalse(env);
        }
        int64_t i, length = metadata[1] / 2;
        for (i = 0; i < length; ++i) {
                uint16_t v1 = buffer[i];
                uint16_t v2 = dataBuffer[i];
                if (v1 >= 97 && v1 <= 122) {
                        v1 -= 32;
                }
                if (v2 >= 97 && v2 <= 122) {
                        v2 -= 32;
                }
                if (v1 != v2) {
                        if(freeAble) {
                                free(dataBuffer);
                        }
                        return createFalse(env);
                }
        }
        if(freeAble) {
                free(dataBuffer);
        }
        return createTrue(env);
}

napi_value Equals(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 1;
        napi_value args[1];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        if(argsLength == 0) {
                return createFalse(env);
        }

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        uint16_t* dataBuffer;
        int64_t dataLength;
        bool freeAble;
        getUTF16FromOutside(env, args[0], &dataBuffer, &dataLength, &freeAble);
        if (dataLength != metadata[1]) {
                if(freeAble) {
                        free(dataBuffer);
                }
                return createFalse(env);
        }
        int64_t c = memcmp(dataBuffer, buffer, dataLength);
        if(freeAble) {
                free(dataBuffer);
        }
        if(c == 0) {
                return createTrue(env);
        }
        return createFalse(env);
}

napi_value StartsWith(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 1;
        napi_value args[1];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        if(argsLength == 0) {
                return createFalse(env);
        }

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        uint16_t* dataBuffer;
        int64_t dataLength;
        bool freeAble;
        getUTF16FromOutside(env, args[0], &dataBuffer, &dataLength, &freeAble);
        if (dataLength > metadata[1]) {
                if(freeAble) {
                        free(dataBuffer);
                }
                return createFalse(env);
        }
        int64_t c = memcmp(dataBuffer, buffer, dataLength);
        if(freeAble) {
                free(dataBuffer);
        }
        if(c == 0) {
                return createTrue(env);
        }
        return createFalse(env);
}

napi_value EndsWith(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 1;
        napi_value args[1];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        if(argsLength == 0) {
                return createFalse(env);
        }

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        uint16_t* dataBuffer;
        int64_t dataLength;
        bool freeAble;
        getUTF16FromOutside(env, args[0], &dataBuffer, &dataLength, &freeAble);
        if (dataLength > metadata[1]) {
                if(freeAble) {
                        free(dataBuffer);
                }
                return createFalse(env);
        }
        int64_t c = memcmp(dataBuffer, buffer + ((metadata[1] - dataLength) / 2), dataLength);
        if(freeAble) {
                free(dataBuffer);
        }
        if(c == 0) {
                return createTrue(env);
        }
        return createFalse(env);
}

napi_value IndexOf(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 3;
        napi_value args[3];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        if(argsLength == 0) {
                return createEmptyArray(env);
        }

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t offset, limit;
        switch(argsLength) {
        case 1:
                offset = 0;
                limit = 0;
                break;
        case 2:
                getRealIndex(env, metadata, args[1], &offset);
                limit = 0;
                break;
        default:
                getRealIndex(env, metadata, args[1], &offset);
                napi_get_value_int64(env, args[2], &limit);
        }

        uint16_t* dataBuffer;
        int64_t dataLength;
        bool freeAble;
        getUTF16FromOutside(env, args[0], &dataBuffer, &dataLength, &freeAble);

        napi_value result;
        result = boyerMooreMagicLen(env, buffer, metadata[1] / 2, dataBuffer, dataLength / 2, offset / 2, limit);

        if(freeAble) {
                free(dataBuffer);
        }
        return result;
}

napi_value IndexOfRegExp(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 3;
        napi_value args[3];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        if(argsLength == 0) {
                return createEmptyArray(env);
        }

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t offset, limit;
        switch(argsLength) {
        case 1:
                offset = 0;
                limit = 0;
                break;
        case 2:
                getRealIndex(env, metadata, args[1], &offset);
                limit = 0;
                break;
        default:
                getRealIndex(env, metadata, args[1], &offset);
                napi_get_value_int64(env, args[2], &limit);
        }

        napi_value result;
        napi_value RegExpSearch;
        napi_get_reference_value(env, RegExpSearchRef,&RegExpSearch);

        napi_value r, s, o,l;
        r = args[0];
        napi_create_string_utf16(env, buffer + (offset / 2), (metadata[1] - offset) / 2, &s);
        napi_create_number(env, offset / 2, &o);
        napi_create_number(env, limit, &l);

        napi_value t_args[4];
        t_args[0] = r;
        t_args[1] = s;
        t_args[2] = o;
        t_args[3] = l;
        napi_call_function(env, me, RegExpSearch, 4, t_args, &result);
        return result;
}

napi_value IndexOfSkip(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 3;
        napi_value args[3];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        if(argsLength == 0) {
                return createEmptyArray(env);
        }

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t offset, limit;
        switch(argsLength) {
        case 1:
                offset = 0;
                limit = 0;
                break;
        case 2:
                getRealIndex(env, metadata, args[1], &offset);
                limit = 0;
                break;
        default:
                getRealIndex(env, metadata, args[1], &offset);
                napi_get_value_int64(env, args[2], &limit);
        }

        uint16_t* dataBuffer;
        int64_t dataLength;
        bool freeAble;
        getUTF16FromOutside(env, args[0], &dataBuffer, &dataLength, &freeAble);

        napi_value result;
        result = boyerMooreMagicLenSkip(env, buffer, metadata[1] / 2, dataBuffer, dataLength / 2, offset / 2, limit);

        if(freeAble) {
                free(dataBuffer);
        }
        return result;
}

napi_value LastIndexOf(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 3;
        napi_value args[3];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        if(argsLength == 0) {
                return createEmptyArray(env);
        }

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t offset, limit;
        switch(argsLength) {
        case 1:
                offset = 0;
                limit = 0;
                break;
        case 2:
                getRealIndex(env, metadata, args[1], &offset);
                limit = 0;
                break;
        default:
                getRealIndex(env, metadata, args[1], &offset);
                napi_get_value_int64(env, args[2], &limit);
        }

        uint16_t* dataBuffer;
        int64_t dataLength;
        bool freeAble;
        getUTF16FromOutside(env, args[0], &dataBuffer, &dataLength, &freeAble);

        napi_value result;
        result = boyerMooreMagicLenRev(env, buffer, metadata[1] / 2, dataBuffer, dataLength / 2, offset / 2, limit);

        if(freeAble) {
                free(dataBuffer);
        }
        return result;
}

napi_value CharAt(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 1;
        napi_value args[1];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        uint16_t* buffer;
        int64_t* metadata;

        getBufferAndMetaData(env, me, &buffer, &metadata);

        int64_t index;
        getRealIndex(env, metadata, args[0], &index);

        napi_value result;
        napi_create_string_utf16(env, buffer + index, 1, &result);
        return result;
};

// TODO -----Static-----

napi_value from(napi_env env, napi_callback_info info){
        napi_value me, newMe;
        size_t argsLength = 2;
        napi_value args[2];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        napi_value StringBuilder;
        napi_get_reference_value(env, StringBuilderRef, &StringBuilder);

        napi_new_instance(env, StringBuilder, argsLength, args, &newMe);
        return newMe;
}

napi_value initialize(napi_env env, napi_callback_info info){
        size_t argsLength = 3;
        napi_value args[3];
        napi_get_cb_info(env, info, &argsLength, args, 0, 0);
        if(argsLength < 3) {
                return createFalse(env);
        }
        napi_value ReadStream = args[0];
        napi_create_reference(env, ReadStream, 1, &ReadStreamRef);
        napi_value ReadFileStream = args[1];
        napi_create_reference(env, ReadFileStream, 1, &ReadFileStreamRef);
        napi_value RegExpSearch = args[2];
        napi_create_reference(env, RegExpSearch, 1, &RegExpSearchRef);
        return createTrue(env);
}

// TODO -----Constructor-----

napi_value constructor(napi_env env, napi_callback_info info){
        napi_value me;

        size_t argsLength = 3;
        napi_value args[3];
        napi_get_cb_info(env, info, &argsLength, args, &me, 0);

        int64_t initialCapacity;
        uint16_t* contentBuffer;
        int64_t contentLength;
        bool freeAble;
        switch(argsLength) {
        case 0:
                contentLength = 0;
                initialCapacity = blockSize / 2;
                break;
        case 1:
                getUTF16FromOutside(env, args[0], &contentBuffer, &contentLength, &freeAble);
                initialCapacity = blockSize / 2;
                break;
        case 2:
                getUTF16FromOutside(env, args[0], &contentBuffer, &contentLength, &freeAble);
                napi_get_value_int64(env, args[1], &initialCapacity);
                break;
        default:
                return me;
        }
        int64_t capacityLength = max(initialCapacity * 2, contentLength);
        int64_t count = (capacityLength + blockSize - 1) / blockSize;
        if(count == 0) {
                count = 1;
        }
        int64_t capacity = count * blockSize;

        napi_value _raw;
        uint8_t* raw;
        napi_create_buffer(env, 16 + capacity, (void**)(&raw), &_raw);

        int64_t* metadata = (int64_t*)raw;
        metadata[0] = capacity;
        metadata[1] = contentLength;

        napi_set_element(env, me, 0, _raw);

        memcpy(raw + 16, contentBuffer, contentLength);
        if(freeAble) {
                free(contentBuffer);
        }
        return me;
}

void Init (napi_env env, napi_value exports, napi_value module, void* priv) {
        napi_property_descriptor allDesc[] = {
                {"from", 0, from, 0, 0, 0, napi_default, 0},
                {"_initialize", 0, initialize, 0, 0, 0, napi_default, 0}
        };
        napi_define_properties(env, exports, 2, allDesc);

        napi_property_descriptor stringBuilderAllDesc[] = {
                {"inspect", 0, Inspect, 0, 0, 0, napi_default, 0},
                {"toString", 0, ToString, 0, 0, 0, napi_default, 0},
                {"toBuffer", 0, ToBuffer, 0, 0, 0, napi_default, 0},
                {"clone", 0, Clone, 0, 0, 0, napi_default, 0},
                {"count", 0, Count, 0, 0, 0, napi_default, 0},
                {"equalsIgnoreCase", 0, EqualsIgnoreCase, 0, 0, 0, napi_default, 0},
                {"equals", 0, Equals, 0, 0, 0, napi_default, 0},
                {"startsWith", 0, StartsWith, 0, 0, 0, napi_default, 0},
                {"endsWith", 0, EndsWith, 0, 0, 0, napi_default, 0},
                {"indexOf", 0, IndexOf, 0, 0, 0, napi_default, 0},
                {"indexOfSkip", 0, IndexOfSkip, 0, 0, 0, napi_default, 0},
                {"indexOfRegExp", 0, IndexOfRegExp, 0, 0, 0, napi_default, 0},
                {"lastIndexOf", 0, LastIndexOf, 0, 0, 0, napi_default, 0},
                {"charAt", 0, CharAt, 0, 0, 0, napi_default, 0},
                {"length", 0, Length, 0, 0, 0, napi_default, 0},
                {"capacity", 0, Capacity, 0, 0, 0, napi_default, 0},
                {"replace", 0, Replace, 0, 0, 0, napi_default, 0},
                {"insert", 0, Insert, 0, 0, 0, napi_default, 0},
                {"clear", 0, Clear, 0, 0, 0, napi_default, 0},
                {"delete", 0, Delete, 0, 0, 0, napi_default, 0},
                {"deleteCharAt", 0, DeleteCharAt, 0, 0, 0, napi_default, 0},
                {"substring", 0, Substring, 0, 0, 0, napi_default, 0},
                {"slice", 0, Substring, 0, 0, 0, napi_default, 0},
                {"substr", 0, Substr, 0, 0, 0, napi_default, 0},
                {"append", 0, Append, 0, 0, 0, napi_default, 0},
                {"appendRepeat", 0, AppendRepeat, 0, 0, 0, napi_default, 0},
                {"appendLine", 0, AppendLine, 0, 0, 0, napi_default, 0},
                {"reverse", 0, Reverse, 0, 0, 0, napi_default, 0},
                {"upperCase", 0, UpperCase, 0, 0, 0, napi_default, 0},
                {"toUpperCase", 0, UpperCase, 0, 0, 0, napi_default, 0},
                {"lowerCase", 0, LowerCase, 0, 0, 0, napi_default, 0},
                {"toLowerCase", 0, LowerCase, 0, 0, 0, napi_default, 0},
                {"replacePattern", 0, ReplacePattern, 0, 0, 0, napi_default, 0},
                {"replaceAll", 0, ReplaceAll, 0, 0, 0, napi_default, 0},
                {"trim", 0, Trim, 0, 0, 0, napi_default, 0},
                {"repeat", 0, Repeat, 0, 0, 0, napi_default, 0},
                {"expandCapacity", 0, ExpandCapacity, 0, 0, 0, napi_default, 0},
                {"shrinkCapacity", 0, ShrinkCapacity, 0, 0, 0, napi_default, 0}
        };
        napi_value cons;
        napi_define_class(env, "StringBuilder", constructor, 0, 38, stringBuilderAllDesc, &cons);
        napi_set_named_property(env, exports, "StringBuilder", cons);
        napi_create_reference(env, cons, 1, &StringBuilderRef);

        napi_value bTrue, bFalse;
        napi_create_number(env, 1, &bTrue);
        napi_coerce_to_bool(env, bTrue, &bTrue);
        napi_create_reference(env, bTrue, 1, &TrueRef);
        napi_create_number(env, 0, &bFalse);
        napi_coerce_to_bool(env, bFalse, &bFalse);
        napi_create_reference(env, bFalse, 1, &FalseRef);
}

NAPI_MODULE(node_stringbuilder, Init);
